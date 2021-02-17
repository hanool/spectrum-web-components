/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const playwright = require('playwright');
const expect = require('chai').expect;
const { startDevServer } = require('@web/dev-server');
const path = require('path');
const fs = require('fs');
var rimraf = require('rimraf');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const storiesAll = require('./stories');

const currentDir = `${process.cwd()}/test/visual/screenshots-current`;
const baselineDir = `${process.cwd()}/test/visual/screenshots-baseline`;

const PixelDiffThreshold = 0;

module.exports = {
    checkScreenshots(
        type,
        color = 'light',
        scale = 'medium',
        dir = 'ltr',
        concurrency = 10
    ) {
        let stories = storiesAll, // .splice(0, 20),
            storyPromises = [],
            testQueue = [],
            results = [],
            server,
            browser,
            viewport = { width: 800, height: 600 },
            contextOpen = true;

        const startBrowser = async () => {
            if (browser) {
                browser.close();
            }
            contextOpen = true;
            return await playwright['chromium'].launchPersistentContext(
                `${baselineDir}/${type}/userDataDir`,
                {
                    viewport,
                }
            );
        };

        const prepareNewBrowserPage = async (browser) => {
            let page;
            try {
                page = await browser.newPage();
            } catch (error) {
                browser = await startBrowser();
                page = await browser.newPage();
            }
            page.on('close', (msg) => {
                console.log(`Page closed: ${msg}`);
            });
            // prevent hover based inaccuracies in screenshots by
            // moving the mouse off of the screen before loading tests
            await page.mouse.move(-5, -5);
            return page;
        };

        describe('👀 page screenshots are correct', function () {
            before(async () => {
                // Prop file system...
                // Create the test directory if needed.
                if (!fs.existsSync(currentDir)) {
                    fs.mkdirSync(currentDir);
                }
                // And it's subdirectories.
                if (!fs.existsSync(`${currentDir}/${type}`)) {
                    fs.mkdirSync(`${currentDir}/${type}`);
                }
                // Create the baseline directory if needed.
                if (!fs.existsSync(baselineDir)) {
                    fs.mkdirSync(baselineDir);
                }
                // And it's subdirectories.
                if (!fs.existsSync(`${baselineDir}/${type}`)) {
                    fs.mkdirSync(`${baselineDir}/${type}`);
                }

                if (fs.existsSync(`${baselineDir}/${type}/userDataDir`)) {
                    rimraf.sync(`${baselineDir}/${type}/userDataDir`);
                }
                fs.mkdirSync(`${baselineDir}/${type}/userDataDir`);

                // start server and browser
                server = await startDevServer({
                    config: {
                        port: 4444,
                        nodeResolve: true,
                        appIndex: 'index.html',
                        rootDir: path.resolve(
                            process.cwd(),
                            'documentation',
                            'dist',
                            'storybook'
                        ),
                    },
                });
                browser = await startBrowser();
                browser.on('close', async (msg) => {
                    contextOpen = false;
                    console.log(`Context closed: ${msg}`);
                });
                for (let i = 0; i < concurrency; i += 1) {
                    (async () => {
                        releasePage(await prepareNewBrowserPage(browser));
                    })();
                }
                for (let i = 0; i < stories.length; i++) {
                    results.push({
                        title: `${stories[i]}__${color}__${scale}__${dir}`,
                        test: queueTest(stories[i]),
                    });
                }
            });

            after(async () => {
                await Promise.all(storyPromises);
                await Promise.all([browser.close(), server.stop()]);
            });

            describe('default view', function () {
                for (let i = 0; i < stories.length; i++) {
                    it(`${stories[i]}__${color}__${scale}__${dir}`, async function () {
                        const test = await results[i].test;
                        storyPromises.push(test());
                    });
                }
            });
        });

        function releasePage(page) {
            if (testQueue[0]) {
                testQueue.shift()(page);
            }
        }

        async function availablePage() {
            let resolver;
            const testPromise = new Promise((res) => (resolver = res));
            testQueue.push(resolver);
            return testPromise;
        }

        async function queueTest(story) {
            const page = await availablePage();
            if (!page.isClosed()) {
                return takeAndCompareScreenshot(page, story);
            }
            console.log('context open 1:', contextOpen);
            if (!contextOpen) {
                browser = await startBrowser();
            }
            console.log('context open 2:', contextOpen);
            const newPage = await prepareNewBrowserPage(browser);
            return takeAndCompareScreenshot(newPage, story);
        }

        const goToAndReturnPage = async (page, test) => {
            if (!contextOpen) {
                browser = await startBrowser();
            }
            try {
                await page.goto(
                    `http://127.0.0.1:4444/iframe.html?id=${test}&sp_reduceMotion=true&sp_color=${color}&sp_scale=${scale}&sp_dir=${dir}`,
                    {
                        waitUntil: 'networkidle',
                        timeout: 11000,
                    }
                );
                await page.waitForFunction(
                    () =>
                        !!document.querySelector('sp-story-decorator') &&
                        !!document.querySelector('sp-story-decorator').ready,
                    null,
                    {
                        timeout: 9000,
                    }
                );
                return page;
            } catch (error) {
                console.log('error:', JSON.stringify(error));
                console.log('test:', test);
                if (page.isClosed()) {
                    if (!contextOpen) {
                        browser = await startBrowser();
                    }
                    const newPage = await prepareNewBrowserPage(browser);
                    return goToAndReturnPage(newPage, test);
                } else if (error.name === 'TimeoutError') {
                    return goToAndReturnPage(page, test);
                }
                throw error;
            }
        };

        //Process methods
        async function takeAndCompareScreenshot(openPage, test) {
            const testFileName = `${test}__${color}__${scale}__${dir}`;
            try {
                let page = await goToAndReturnPage(openPage, test);
                await page.screenshot({
                    path: `${currentDir}/${type}/${testFileName}.png`,
                });
                if (
                    !fs.existsSync(`${baselineDir}/${type}/${testFileName}.png`)
                ) {
                    releasePage(page);
                    return Promise.resolve(() => {
                        console.log(
                            `🙅🏼‍♂️ ${testFileName}.png does not have a baseline screenshot.`
                        );
                        expect(
                            true,
                            `🙅🏼‍♂️ ${testFileName}.png does not have a baseline screenshot.`
                        ).to.equal(false);
                    });
                }
                return await compareScreenshots(test, page);
            } catch (error) {
                releasePage(openPage);
                return Promise.resolve(() => {
                    console.log(
                        `🤷‍♀️ ${testFileName} failed to load. Does it exist in the test content?`
                    );
                    expect(
                        true,
                        `🤷‍♀️ ${testFileName} failed to load. Does it exist in the test content? ${error}`
                    ).to.equal(false);
                });
            }
        }

        function compareScreenshots(view, page) {
            return new Promise((resolve, reject) => {
                const testFileName = `${view}__${color}__${scale}__${dir}`;
                // Note: for debugging, you can dump the screenshotted img as base64.
                // fs.createReadStream(`${currentDir}/${type}/test.png`, { encoding: 'base64' })
                //   .on('data', function (data) {
                //     console.log('got data', data)
                //   })
                //   .on('end', function () {
                //     console.log('\n\n')
                //   });
                const img1 = fs
                    .createReadStream(
                        `${currentDir}/${type}/${testFileName}.png`
                    )
                    .pipe(new PNG())
                    .on('parsed', doneReading);
                const img2 = fs
                    .createReadStream(
                        `${baselineDir}/${type}/${testFileName}.png`
                    )
                    .pipe(new PNG())
                    .on('parsed', doneReading);

                let filesRead = 0;
                function doneReading() {
                    // Wait until both files are read.
                    if (++filesRead < 2) return;

                    // The files should be the same size.
                    expect(img1.width, 'image widths are the same').equal(
                        img2.width
                    );
                    expect(img1.height, 'image heights are the same').equal(
                        img2.height
                    );

                    // Do the visual diff.
                    const diff = new PNG({
                        width: img1.width,
                        height: img1.height,
                    });

                    const numDiffPixels = pixelmatch(
                        img1.data,
                        img2.data,
                        diff.data,
                        img1.width,
                        img1.height,
                        { threshold: 0 }
                    );
                    const percentDiff =
                        (numDiffPixels / (img1.width * img1.height)) * 100;

                    const stats = fs.statSync(
                        `${currentDir}/${type}/${testFileName}.png`
                    );
                    const fileSizeInBytes = stats.size;

                    if (numDiffPixels > PixelDiffThreshold) {
                        diff.pack().pipe(
                            fs.createWriteStream(
                                `${currentDir}/${testFileName}-diff.png`
                            )
                        );
                    }
                    releasePage(page);
                    resolve(() => {
                        console.log(
                            `📸 ${testFileName}.png => ${fileSizeInBytes} bytes, ${percentDiff}% different.`
                        );
                        expect(
                            numDiffPixels,
                            'number of different pixels'
                        ).to.equal(PixelDiffThreshold);
                    });
                }
            });
        }
    },
};
