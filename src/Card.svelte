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
<svelte:options  customElement='expander-sub-card-ultimate' />

<script lang="ts">
    import type { LovelaceCard, HomeAssistant, LovelaceCardConfig } from 'custom-card-helpers';
    import { getCardUtil } from './cardUtil.svelte';
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';

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

    function createShadowStyle($style: string){
        const shadowStyle = document.createElement('style');
        shadowStyle.innerHTML = $style;
        return shadowStyle;
    }

    $effect(() => {
        if (container) {
            container.hass = hass;
        }
    });

    onMount(async () => {
        console.log('ExpanderSubCard onMount');
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
        loading = false;

        if(isTitleCard && styleTarget !== '' && styles !== ''){

            console.log(container, 'isTitleCard', isTitleCard, 'styleTarget', styleTarget, 'styles', styles);

            let stylesArray = parseStylesFromStringToObject(styles);
            console.log(stylesArray);

            setTimeout(() => {
                let element: any = container;
                let maxLoops = 20;

                while (maxLoops > 0) {
                    console.log(element);
                    if (element.querySelector(styleTarget)) {
                        console.log('MATCH', element);
                        console.log(createCssRules(stylesArray));
                        element.prepend(createShadowStyle(createCssRules(stylesArray)));
                        break;
                    }

                    let nextObject: any = element.firstElementChild !== undefined && element.firstElementChild !== null ? element.firstElementChild : (element.shadowRoot !== undefined ? element.shadowRoot : null);
                    console.log('nextObject', nextObject);

                    if (nextObject === null) {
                        console.log('no valid child found to append styles');
                        break;
                    }

                    element = nextObject;
                    maxLoops--;
                }
            }, 2000);

        }
    });

    function parseStylesFromStringToObject(styles: string){
        let error = `no valid styles for the title-card detected. use the following pattern (multiple entries, by comma-separation possible):
                <selector>=<style1>:<value1>|<style2>:<value2>`;

        let generatedStyles: any = {};
        let data = styles.split(',');

        if (data.length === 0) {
            console.warn(error, 'configSplit');
            return generatedStyles;
        }

        data.forEach(function (item, index) {
            let styleData = item.split(',');

            styleData.forEach(function (styleConfig, index) {
                let selectorSplit = styleConfig.split('=');

                if (selectorSplit.length !== 2) {
                    console.warn(error, 'selectorSplit', selectorSplit);
                    return;
                }

                let selector = selectorSplit[0];
                let stylesSplit = selectorSplit[1].split('|');

                let generatedStyle: Array<object> = [];

                stylesSplit.forEach(function (style, index) {
                    let styleSplit = style.split(':');

                    if (styleSplit.length !== 2) {
                        console.warn(error, 'styleSplit', styleSplit);
                        return;
                    }

                    generatedStyle.push({
                        style: styleSplit[0],
                        value: styleSplit[1],
                    })
                });

                generatedStyles[selector] = generatedStyle
            });
        });

        return generatedStyles;
    }

    function createCssRules(objects: object){
        return Object.entries(objects).map(function ([selector, styles]) {
            return `
            ${selector} {
                ${createCssStyles(styles)}
            }
            `;
        }).join('');
    }

    function createCssStyles(stylesArray: Array<CssStyleObject>){
        return stylesArray.map(function (styleObject: CssStyleObject) {
            return `${styleObject.style}: ${styleObject.value}
            `;
        }).join('');
    }
</script>

<svelte:element this={type} bind:this={container} transition:slide|local />
{#if loading}
    <span style={'padding: 1em; display: block; '}> Loading... </span>
{/if}

<style>
</style>
