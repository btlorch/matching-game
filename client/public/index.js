/*global FB*/

// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';


function Card(props) {
    // Shift to center
    let style = {
        top: props.y - 125,
        left: props.x - 125,
        transform: `rotate( ${props.rotation}deg )`,
    };

    let faceClass = "face";
    if (props.open) {
        faceClass += " open";
    }
    if (props.match) {
        faceClass += " match";
    }
    if (props.mismatch) {
        faceClass += " mismatch";
    }
    if (props.hidden) {
        faceClass += " hidden";
    }

    return (
      React.createElement(
          "div",
          { className: "card",
              style: style },
          React.createElement(
              "div",
              { className: faceClass, onClick: props.onClick },
              React.createElement(
                  "div",
                  { className: "front" },
                  React.createElement("img", { src: "https://raw.githubusercontent.com/btlorch/matching-game/master/client/public/logo.png", alt: "Front" })
              ),
              React.createElement(
                  "div",
                  { className: "back" },
                  React.createElement("img", { src: props.imgUrl, alt: "Back" })
              )
          )
      )
    );
}


class CardDeck extends React.Component {
    constructor(props) {
        super(props);
        this.cards = createCards(20, props.pairedPhotosSet);
        this.state = {
            cardProperties: this.cards.map(() => {
                return {
                    open: false,
                    match: false,
                    mismatch: false,
                    hidden: false,
                }
            })
        };
    }

    handleClick(i) {
        // Ignore clicks on already open cards
        if (this.state.cardProperties[i].open) {
            return false;
        }

        let openCardsIndices = this.state.cardProperties.reduce((a, e, i) => (e.open) ? a.concat(i) : a, []);
        // Also ignore clicks as long as there are two cards open
        if (openCardsIndices.length >= 2) {
            return;
        }

        // Flip open
        let cardProperties = this.state.cardProperties.slice();
        cardProperties[i].open = true;
        this.setState({
            cardProperties: cardProperties
        });

        // If two cards are open and they match, highlight them up for a second
        openCardsIndices = cardProperties.reduce((a, e, i) => (e.open) ? a.concat(i) : a, []);
        if (openCardsIndices.length < 2) {
            return;
        }
        else if (openCardsIndices.length > 2) {
            // This case should not happen, because we have checked for two open cards before flipping another card open already
            alert("More than two cards open");
        }
        else {
            // Now there are two cards open
            cardProperties = cardProperties.slice();
            // Do they match
            let matches = (this.cards[openCardsIndices[0]].matchKey === this.cards[openCardsIndices[1]].matchKey);
            if (matches) {
                // Highlight cards in green
                cardProperties[openCardsIndices[0]].match = true;
                cardProperties[openCardsIndices[1]].match = true;
            }
            else {
                // Highlight cards in red
                cardProperties[openCardsIndices[0]].mismatch = true;
                cardProperties[openCardsIndices[1]].mismatch = true;
            }

            this.setState({
                cardProperties: cardProperties
            });
            let that = this;

            // Set timer to do something with those cards
            setTimeout(function() {
                cardProperties = cardProperties.slice();
                cardProperties[openCardsIndices[0]].open = false;
                cardProperties[openCardsIndices[1]].open = false;
                console.log(matches);

                if (matches) {
                    // Remove cards
                    cardProperties[openCardsIndices[0]].hidden = true;
                    cardProperties[openCardsIndices[1]].hidden = true;
                    cardProperties[openCardsIndices[0]].match = false;
                    cardProperties[openCardsIndices[1]].match = false;
                }
                else {
                    // Remove highlight and flip closed
                    cardProperties[openCardsIndices[0]].mismatch = false;
                    cardProperties[openCardsIndices[1]].mismatch = false;
                }

                that.setState({
                    cardProperties: cardProperties
                });
            }, 1000);
        }

    }

    renderCard(i) {
        let card = this.cards[i];
        return (
          React.createElement(Card, {
                              key: i,
                              x: card.x * this.props.gameWindowWidth,
                              y: card.y * this.props.gameWindowHeight,
                              rotation: card.rotation,
                              imgUrl: card.imgUrl,
                              open: this.state.cardProperties[i].open,
                              match: this.state.cardProperties[i].match,
                              mismatch: this.state.cardProperties[i].mismatch,
                              hidden: this.state.cardProperties[i].hidden,
                              onClick: () => this.handleClick(i)
              })
        );
    }

    render() {
        return (
          React.createElement(
              "div",
              { className: "card-deck" },
              this.cards.map((card, i) => this.renderCard(i))
          )
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gameWindowWidth: 0,
            gameWindowHeight: 0,
        };
        this.updateSize = this.updateSize.bind(this);
    }

    componentDidMount() {
        this.updateSize();
        window.addEventListener("resize", this.updateSize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateSize);
    }

    componentDidUpdate() {
        this.updateSize();
    }

    updateSize() {
        if (this.state.gameWindowHeight !== this.div.clientHeight || this.state.gameWindowWidth !== this.div.clientWidth) {
            this.setState({
                gameWindowHeight: this.div.clientHeight,
                gameWindowWidth: this.div.clientWidth
            });
        }
    }

    render() {
        return (
          React.createElement(
              "div",
              { ref: div => {
                      this.div = div;
                  }, className: "game" },
              React.createElement(CardDeck, { pairedPhotosSet: this.props.pairedPhotosSet,
                  onClick: this.handleClick,
                  gameWindowWidth: this.state.gameWindowWidth,
                  gameWindowHeight: this.state.gameWindowHeight
              })
          )
        );
    }
}

// ReactDOM.render(
//     React.createElement(Game, { pairedPhotosSet: pairedPhotos }), document.getElementById('root')
// );

function createCards(numCards, pairedPhotosSet) {
    let images = pairedPhotosSet;

    let cards = Array(numCards);
    let rows = Math.floor(Math.sqrt(numCards));
    let cols = Math.ceil(numCards * 1.0 / rows);

    // The largest row values is going to be (rows - 1) / rows, thus we can move everything by 1 / (rows / 2)
    let rowOffset = 1.0 / (rows * 2.0);
    let colOffset = 1.0 / (cols * 2.0);

    // x and y are going to be the center coordinates
    for (let i = 0; i < numCards; i++) {
        // let matchKey = images[i].match("^[a-z]+")[0];
        // console.log(matchKey);

        let row = Math.floor(i / cols);
        let col = i % cols;
        cards[i] = {
            x: col * 1.0 / cols + colOffset,
            y: row * 1.0 / rows + rowOffset,
            rotation: Math.round(Math.random() * 20) - 10,
            matchKey: Math.floor(i/2),
            imgUrl: (i % 2 == 0) ? images[Math.floor(i/2)].url1 : images[Math.floor(i/2)].url2
          }
    }

    shuffle(cards);

    return cards;
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
