<!--
/*
Copyright 2021-2022 Peter Repukat - FlatspotSoftware
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
-->
<!-- eslint-disable-next-line svelte/valid-compile -->
<svelte:options customElement='expander-sub-card-ultimate'/>

<script lang="ts">
    import type {HomeAssistant, LovelaceCard, LovelaceCardConfig} from 'custom-card-helpers';
    import {getCardUtil} from './cardUtil.svelte';
    import {onDestroy, onMount} from 'svelte';
    import {slide} from 'svelte/transition';

    type CssStyleObject = {
        style: string;
        value: string;
    };

    const {
        type = 'div',
        config,
        hass,
        clearChild = false,
        isTitleCard = false,
        styleTarget = '',
        styles = '',
    }: { type: string; config: LovelaceCardConfig; hass: HomeAssistant; clearChild: boolean; isTitleCard: boolean; styleTarget: string; styles: string } = $props();

    let container = $state<LovelaceCard>();
    let loading = $state(true);

    $effect(() => {
        if (container) {
            container.hass = hass;
        }
    });


    // $effect(() => {
    //     if (container) {
    //         container.hass = hass;
    //     }
    //
    //     if (isTitleCard && styleTarget !== '' && styles !== '') {
    //         let stylesArray = parseStylesFromStringToObject(styles);
    //         console.log(stylesArray);
    //
    //         // setTimeout(() => {
    //         let element: any = container;
    //         let maxLoops = 20;
    //
    //         while (maxLoops > 0) {
    //             console.log(element);
    //             if (element.querySelector(styleTarget)) {
    //                 console.log('MATCH', element);
    //                 console.log(createCssRules(stylesArray));
    //                 element.prepend(createShadowStyle(createCssRules(stylesArray)));
    //                 break;
    //             }
    //
    //             let nextObject: any = element.firstElementChild !== undefined && element.firstElementChild !== null ? element.firstElementChild : (element.shadowRoot !== undefined ? element.shadowRoot : null);
    //             console.log('nextObject', nextObject);
    //
    //             if (nextObject === null) {
    //                 console.log('no valid child found to append styles');
    //                 break;
    //             }
    //
    //             element = nextObject;
    //             maxLoops--;
    //         }
    //         // }, 100);
    //
    //     }
    // });

    onMount(async () => {
        console.log('SUB-CARD MOUNTED:', new Date().toLocaleTimeString());
        const util = await getCardUtil();
        const el = util.createCardElement(config);
        el.hass = hass;

        if (!container) {
            console.error('container doesn\'t exist');
            return;
        }

        container.replaceWith(el);
        container = el;
        if (clearChild) {
            el.shadowRoot?.appendChild(createShadowStyle(`
                ha-card {
                    background-color: transparent !important;
                    border-style: none !important;
                }
            `));
        }

        if (isTitleCard && styleTarget && styles) {
            await applyTitleCardStyles(el, styleTarget, styles);
        }

        loading = false;
    });

    onDestroy(() => {
        console.log('SUB-CARD DESTROYED:', new Date().toLocaleTimeString());
    });

    /**
     * Asynchronously waits for an element to exist in the DOM.
     * Searches within the element and its shadow roots.
     */
    async function waitForElement(
        rootElement: HTMLElement,
        selector: string,
        timeout = 5000
    ): Promise<Element | null> {
        return new Promise((resolve) => {
            const startTime = Date.now();

            const findElement = (element: Element | ShadowRoot): Element | null => {
                const found = element.querySelector(selector);
                if (found) return found;

                // Search in all child elements for shadow roots
                for (const child of Array.from(element.children)) {
                    if (child.shadowRoot) {
                        const foundInShadow = findElement(child.shadowRoot);
                        if (foundInShadow) return foundInShadow;
                    }
                }
                return null;
            };

            const check = () => {
                const element = findElement(rootElement);
                if (element) {
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    console.warn(`Element "${selector}" not found within timeout.`);
                    resolve(null);
                } else {
                    requestAnimationFrame(check);
                }
            };

            check();
        });
    }

    async function applyTitleCardStyles(cardElement: LovelaceCard, targetSelector: string, stylesString: string) {
        const targetElement = await waitForElement(cardElement, targetSelector);

        if (targetElement && targetElement.querySelector('style') === null) {
            const cssRules = createCssRules(parseStylesFromStringToObject(stylesString));

            if (cssRules) {
                targetElement.prepend(createShadowStyle(cssRules));
            }
        }
    }

    function createShadowStyle(style: string): HTMLStyleElement {
        const shadowStyle = document.createElement('style');
        shadowStyle.innerHTML = style;
        return shadowStyle;
    }

    function parseStylesFromStringToObject(stylesStr: string): Record<string, CssStyleObject[]> {
        const errorMsg = `no valid styles for the title-card detected. use the following pattern (multiple entries, by comma-separation possible):
            <selector>=<style1>:<value1>|<style2>:<value2>`;

        if (!stylesStr) return {};

        try {
            return Object.fromEntries(
                stylesStr.split(',').map((part) => {
                    const [selector, styles] = part.trim().split('=');
                    if (!selector || !styles) throw new Error();

                    const styleArray = styles.split('|').map((stylePair) => {
                        const [style, value] = stylePair.trim().split(':');
                        if (!style || !value) throw new Error();
                        return {style, value};
                    });

                    return [selector, styleArray];
                })
            );
        } catch (e) {
            console.warn(errorMsg, stylesStr);
            return {};
        }
    }

    function createCssRules(objects: Record<string, CssStyleObject[]>): string {
        return Object.entries(objects).map(([selector, styles]) => `${selector} {
                ${createCssStyles(styles)}
            }`)
            .join('\n')
            .trim();
    }

    function createCssStyles(stylesArray: CssStyleObject[]): string {
        return stylesArray
            .map((styleObject) => `${styleObject.style}: ${styleObject.value};`)
            .join('\n')
            .trim();
    }

    // function parseStylesFromStringToObject(styles: string){
    //     let error = `no valid styles for the title-card detected. use the following pattern (multiple entries, by comma-separation possible):
    //             <selector>=<style1>:<value1>|<style2>:<value2>`;
    //
    //     let generatedStyles: any = {};
    //     let data = styles.split(',');
    //
    //     if (data.length === 0) {
    //         console.warn(error, 'configSplit');
    //         return generatedStyles;
    //     }
    //
    //     data.forEach(function (item, index) {
    //         let styleData = item.split(',');
    //
    //         styleData.forEach(function (styleConfig, index) {
    //             let selectorSplit = styleConfig.split('=');
    //
    //             if (selectorSplit.length !== 2) {
    //                 console.warn(error, 'selectorSplit', selectorSplit);
    //                 return;
    //             }
    //
    //             let selector = selectorSplit[0];
    //             let stylesSplit = selectorSplit[1].split('|');
    //
    //             let generatedStyle: Array<object> = [];
    //
    //             stylesSplit.forEach(function (style, index) {
    //                 let styleSplit = style.split(':');
    //
    //                 if (styleSplit.length !== 2) {
    //                     console.warn(error, 'styleSplit', styleSplit);
    //                     return;
    //                 }
    //
    //                 generatedStyle.push({
    //                     style: styleSplit[0],
    //                     value: styleSplit[1],
    //                 })
    //             });
    //
    //             generatedStyles[selector] = generatedStyle
    //         });
    //     });
    //
    //     return generatedStyles;
    // }

    // function createCssRules(objects: object){
    //     return Object.entries(objects).map(function ([selector, styles]) {
    //         return `${selector} {
    //             ${createCssStyles(styles)}
    //         }`;
    //     }).join("\n").trim();
    // }
    //
    // function createCssStyles(stylesArray: Array<CssStyleObject>){
    //     return stylesArray.map(function (styleObject: CssStyleObject) {
    //         return `${styleObject.style}: ${styleObject.value};`;
    //     }).join("\n").trim();
    // }
</script>

<svelte:element this={type} bind:this={container} transition:slide|local/>
{#if loading}
    <span style={'padding: 1em; display: block; '}> Loading... </span>
{/if}

<style>
</style>
