# Expander Card for HomeAssistant

![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/Alia5/lovelace-expander-card?color=green&label=release)
![GitHub all releases](https://img.shields.io/github/downloads/Alia5/lovelace-expander-card/total)
![GitHub Repo stars](https://img.shields.io/github/stars/Alia5/lovelace-expander-card)

Expander/Collapsible card for HomeAssistant  


Please ⭐️ or sponsor this repo if you find it useful.

## Demo

![Sample gif](examples/example.gif)

---

Expand button as overlay:
![Sample lights overlay](examples/lights_overlay_button.png)

---

You can even nest expanders!  

![Sample nesting](examples/nested.png)

---


Clear Background (default theme):  

![Sample clear router](examples/clear_router.png)

## Options

**Graphical config supported**

![Sample editor](examples/editor.png)


Yaml:

| Name                      | Type     | Default       | Supported options               | Description                                                    |
| ------------------------- | -------- | ------------- |---------------------------------| -------------------------------------------------------------- |
| type                      | string   | **Required**  | `custom:expander-card-ultimate` | Type of the card.                                              |
| title                     | string   | _Expander_    | *                               | Title (Not displayed if using Title-Card)                      |
| clear                     | boolean  | _false_       | true\|false                     | Remove Background                                              |
| clear-children            | boolean  | _false_       | true\|false                     | Remove Backgrounds/Borders of child cards                      |
| expanded                  | boolean  | _false_       | true\|false                     | Start expanded                                                 |
| expand-id                 | string   | **optional**  | string                          | Unique ID to use for JS LocalStorage. Will save expanded state |
| button-background         | string   | _transparent_ | css-color                       | Background color of expand button                              |
| gap                       | string   | _0.6em_       | css-size                        | gap between child cards                                        |
| padding                   | string   | _1em_         | css-size                        | padding of all card content                                    |
| child-padding             | string   | _0.5em_       | css-size                        | padding of child cards                                         |
| title-card                | object   | **optional**  | LovelaceCardConfig              | Replace Title with card                                        |
| title-card-padding        | string   | _0px_         | css-size                        | padding of title-card                                          |
| title-card-button-overlay | boolean  | _false_       | true\|false                     | Overlay expand button over title-card                          |
| overlay-margin            | string   | _2em_         | css-size                        | Margin from top right of expander button (if overlay)          |
| cards                     | object[] | **optional**  | LovelaceCardConfig[]            | Child cards to show when expanded                              |

## Installation

### HACS

Click on the button below to add this repository to your HACS sources and open the integration in HACS automatically.

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Alia5&repository=lovelace-expander-card&category=integration)

Alternatively, you can add it manually by following the [documentation here](https://hacs.xyz/docs/faq/custom_repositories/).

The link to the repository is https://github.com/JtheGunner/lovelace-expander-card-ultimate#

### Manual install
#### 1. Download the card

Install the `expander-card-ultimate` card by copying `lovelace-expander-card-ultimate.js` to `<config directory>/www/lovelace-expander-card-ultimate.js`

Bash:

```bash
wget https://github.com/JtheGunner/lovelace-expander-card-ultimate/releases/download/latest/lovelace-expander-card.js
mv lovelace-expander-card-ultimate.js /config/www/
```

#### 2. Link the card to your lovelace ui

##### The manual way:

Link `expander-card-ultimate` inside your `ui-lovelace.yaml`

```yaml
resources:
  - url: /local/lovelace-expander-card-ultimate.js
    type: js
```

## Note on closing the issue tracker

FOSS is broken.
People suck

I don't care anymore.
