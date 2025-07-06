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

    const {
        type = 'div',
        config,
        hass,
        clearChild = false,
        isTitleCard = false,
        styleTarget = '',
        styles = {},
    }: { type: string; config: LovelaceCardConfig; hass: HomeAssistant; clearChild: boolean; isTitleCard: boolean; styleTarget: string; styles: {} } = $props();

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
            console.log(el);
            el.shadowRoot?.appendChild(createShadowStyle(`
                ha-card {
                    background-color: transparent !important;
                    border-style: none !important;
                }
            `));
        }
        loading = false;

        console.log('isTitleCard', isTitleCard, 'styleTarget', styleTarget, 'styles', styles);

        if(isTitleCard && styleTarget !== '' && Object.keys(styles).length > 0){
            let maxLoops = 20;
            let obj: any = el;

            while(maxLoops > 0){
                console.log(obj);
                if(obj.querySelector(styleTarget)){
                    obj.appendChild(createShadowStyle(Object.entries(styles).map(function ([selector, size]) {
                        return `
                            :global(${selector}) {
                                font-size: ${size} !important;
                            }

                            & :global(${selector}) {
                                font-size: ${size} !important;
                            }
                            `;
                    }).join('')));
                    break;
                }

                let nextObject: any =  obj.shadowRoot !== undefined ? obj.shadowRoot : (obj.firstElementChild !== undefined ? obj.firstElementChild : null);

                if(nextObject === null){
                    console.log('no valid child found to append styling');
                    break;
                }

                obj = nextObject;
                maxLoops--;
            }
        }
    });
</script>

<svelte:element this={type} bind:this={container} transition:slide|local />
{#if loading}
    <span style={'padding: 1em; display: block; '}> Loading... </span>
{/if}

<style>
</style>
