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
        customStyles = '',
        defaultStyles = '',
    }: { type: string; config: LovelaceCardConfig; hass: HomeAssistant; clearChild: boolean; isTitleCard: boolean; customStyles: string; defaultStyles: string } = $props();

    let container = $state<LovelaceCard>();
    let loading = $state(true);

    $effect(() => {
        if (container) {
            container.hass = hass;
        }
    });


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

        }

        el.shadowRoot?.appendChild(createShadowStyle(`
                ha-card {
                    background-color: transparent !important;
                    border-style: none !important;
                }
            `));

        let element = el;
        let styles = trimPipe(trimPipe(customStyles) + ';;' + trimPipe(defaultStyles));
        console.log('element', element);
        console.log(customStyles);
        console.log(defaultStyles);
        console.log(styles);

        if (isTitleCard && styles) {
            await applyTitleCardStyles(element, styles);
        }

        loading = false;
    });

    onDestroy(() => {
        console.log('SUB-CARD DESTROYED:', new Date().toLocaleTimeString());
    });

    function trimPipe(str: string): string {
        return str.replace(/^;+|;+$/g, '');
    }

    /**
     * Asynchronously waits for an element to exist in the DOM.
     * Searches within the element and its shadow roots.
     */
    async function waitForElements(
        element: any,
        targetNames: Array<string>,
        targetElements: any = {},
    ): Promise<object | null> {
        return new Promise(async (resolve) => {
            const selector = targetNames.join(', ');
            console.log('element', element);
            console.log('selector', selector);

            const foundElements = element.querySelectorAll(selector);
            console.log('foundElements', foundElements)

            foundElements.forEach((found: any) => {
                let foundName = found.localName;
                targetElements[foundName] = element;
                targetNames = targetNames.filter(function (name: string) {
                    return name !== foundName
                })
            });

            console.log('targetElements', targetElements);
            console.log('targetNames', targetNames);
            console.log('element.firstElementChild', element.firstElementChild);
            console.log('element.shadowRoot', element.shadowRoot);

            let nextObject: any = element.firstElementChild !== undefined && element.firstElementChild !== null ? element.firstElementChild : (element.shadowRoot !== undefined ? element.shadowRoot : null);
            console.log('nextObject', nextObject);

            if (targetNames.length > 0 && nextObject !== null) {
                targetElements = await waitForElements(nextObject, targetNames, targetElements)
            }

            resolve(targetElements);
        });
    }

    async function applyTitleCardStyles(cardElement: LovelaceCard, styles: string) {
        const parsedObjects: any = parseStyleString(styles);
        const targets = Object.keys(parsedObjects);
        const targetElements = await waitForElements(cardElement, targets, {});

        console.log('parseStyleString', parsedObjects, targetElements);
        console.log('targetElement', targetElements);
        // console.log('style element vorhanden', targetElement?.querySelector('style'))

        if (targetElements === null) return;

        for (const [targetName, element] of Object.entries(targetElements)) {
            let cssRule = createCssRules(parsedObjects[targetName]);

            if (cssRule) {
                element.prepend(createShadowStyle(cssRule));
            }
        }
    }


    function createShadowStyle(style: string): HTMLStyleElement {
        const shadowStyle = document.createElement('style');
        shadowStyle.innerHTML = style;
        return shadowStyle;
    }

    /**
     * parse a separator based string to valid css config by their matching dom-targets
     *
     * Hierarchy of separators:
     * 1. `;;` -> split the basic groups (domTarget + configs)
     * 2. `:::` -> split domTargets from their configurations
     * 3. `&&` -> split multiple selectors from the same domTarget
     * 4. `||` -> split css-selectors from their style-configs
     * 5. `,`  -> split multiple style declarations
     * 6. `:`  -> split style key from value
     *
     * @param {string} inputString separator based string
     * @returns {object} structured object to generate css
     */
    function parseStyleString(inputString: string): object {
        const finalStructure: any = {};

        if (!inputString) {
            return finalStructure;
        }

        const groups = inputString.split(';;');

        for (const group of groups) {
            if (!group) continue;

            // 2. domTarget von der CSS-Konfiguration trennen
            const [domTarget, cssConfig] = group.split(':::');
            if (!domTarget || !cssConfig) continue;

            // Initialisiere das Objekt für diesen domTarget, falls nicht vorhanden
            finalStructure[domTarget] = finalStructure[domTarget] || {};

            // 3. Mehrere Selektoren trennen
            const selectorBlocks = cssConfig.split('&&');

            for (const block of selectorBlocks) {
                if (!block) continue;

                // 4. Selektor von den Styles trennen
                const [selector, stylesString] = block.split('||');
                if (!selector || !stylesString) continue;

                // 5. & 6. Styles parsen
                const styles = stylesString
                    .split(',')
                    .map(stylePair => {
                        if (!stylePair) return null;

                        // Trennt Key und Value, auch wenn Value selbst ein ':' enthält
                        const [key, ...valueParts] = stylePair.split(':');
                        const value = valueParts.join(':');

                        if (!key || value === undefined) return null;

                        return {key: key.trim(), value: value.trim()};
                    })
                    .filter(Boolean); // remove potential null values

                if (styles.length > 0) {
                    finalStructure[domTarget][selector.trim()] = styles;
                }
            }
        }

        return finalStructure;
    }

    // function parseStylesFromStringToObject(stylesStr: string): Record<string, CssStyleObject[]> {
    //     const errorMsg = `no valid styles for the title-card detected. use the following pattern (multiple entries, by comma-separation possible):
    //     <selector>=<style1>:<value1>|<style2>:<value2>`;
    //
    //     if (!stylesStr) return {};
    //
    //     try {
    //         return Object.fromEntries(
    //             stylesStr.split(';;').map((part) => {
    //                 const [domElement, styleConfig] = part.trim().split(':::');
    //                 if (!domElement || !styleConfig) throw new Error();
    //
    //                 const [selector, style] = part.trim().split('||');
    //                 if (!selector || !style) throw new Error();
    //
    //                 const styleArray = styleConfig.split('|').map((stylePair) => {
    //                     const [style, value] = stylePair.trim().split(':');
    //                     if (!style || !value) throw new Error();
    //                     return {style, value};
    //                 });
    //
    //                 return [domElement, styleArray];
    //             })
    //         );
    //     } catch (e) {
    //         console.warn(errorMsg, stylesStr);
    //         return {};
    //     }
    // }

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

</script>

<svelte:element this={type} bind:this={container} transition:slide|local/>
{#if loading}
    <span style={'padding: 1em; display: block; '}> Loading... </span>
{/if}

<style>
</style>
