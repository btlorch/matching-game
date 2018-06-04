import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


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
        <div className="card"
             style={style}>
            <div className={faceClass} onClick={props.onClick}>
                <div className="front">
                    <img src="flipside.jpg" alt="Front"/>
                </div>
                <div className="back">
                    <img src={props.imgUrl} alt="Back" />
                </div>
            </div>
        </div>
    );
}


class CardDeck extends React.Component {
    constructor(props) {
        super(props);
        this.cards = createCards(20);
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

                // As soon as the game is over, forward to prize page
                let remainingCards = cardProperties.reduce((a, e, i) => (!e.hidden) ? a.concat(i) : a, []);
                if (0 === remainingCards.length) {
                    window.location.href = "price.html";
                }

            }, 1000);
        }

    }

    renderCard(i) {
        let card = this.cards[i];
        return (
            <Card
                key={i}
                x={card.x * this.props.gameWindowWidth}
                y={card.y * this.props.gameWindowHeight}
                rotation={card.rotation}
                imgUrl={card.imgUrl}
                open={this.state.cardProperties[i].open}
                match={this.state.cardProperties[i].match}
                mismatch={this.state.cardProperties[i].mismatch}
                hidden={this.state.cardProperties[i].hidden}
                onClick={() => this.handleClick(i)}
            />
        );
    }

    render() {
        return (
            <div className="card-deck">
            {
                this.cards.map((card, i) => this.renderCard(i))
            }
            </div>
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
            <div ref={ div => { this.div = div }} className="game">
                <CardDeck
                    onClick={this.handleClick}
                    gameWindowWidth={this.state.gameWindowWidth}
                    gameWindowHeight={this.state.gameWindowHeight}
                />
            </div>
        );
    }
}


class Timer extends React.Component {
    constructor() {
        super();
        this.state = { time: {}, seconds: 120 };
        this.timer = 0;
        this.startTimer = this.startTimer.bind(this);
        this.countDown = this.countDown.bind(this);
    }

    secondsToTime(secs){
        let hours = Math.floor(secs / (60 * 60));

        let divisor_for_minutes = secs % (60 * 60);
        let minutes = Math.floor(divisor_for_minutes / 60);

        let divisor_for_seconds = divisor_for_minutes % 60;
        let seconds = Math.ceil(divisor_for_seconds);

        let obj = {
            "h": hours,
            "m": minutes,
            "s": seconds
        };
        return obj;
    }

    componentDidMount() {
        let timeLeftVar = this.secondsToTime(this.state.seconds);
        this.setState({ time: timeLeftVar });

        this.startTimer();
    }

    startTimer() {
        if (this.timer === 0) {
            this.timer = setInterval(this.countDown, 1000);
        }
    }

    componentWillUnmount() {
        if (this.timer !== 0) {
            clearInterval(this.timer);
        }
    }

    countDown() {
        // Remove one second, set state so a re-render happens.
        let seconds = this.state.seconds - 1;
        this.setState({
            time: this.secondsToTime(seconds),
            seconds: seconds,
        });

        // Check if we're at zero.
        if (seconds === 0) {
            clearInterval(this.timer);
            window.location.href = "timeout.html";
        }
    }

    render() {
        return(
            <span>{this.state.time.m} m {this.state.time.s} s</span>
        );
    }
}


ReactDOM.render(
    <Game />,
    document.getElementById('root'),
);

ReactDOM.render(
    <Timer />,
    document.getElementById('timer')
);

function multishuffle() {
    let isArray = Array.isArray || function(value) {
        return {}.toString.call(value) !== "[object Array]"
    };

    let arrLength = 0;
    let argsLength = arguments.length;
    let rnd, tmp;

    for (let index = 0; index < argsLength; index += 1) {
        if (!isArray(arguments[index])) {
            throw new TypeError("Argument is not an array.");
        }

        if (index === 0) {
            arrLength = arguments[0].length;
        }

        if (arrLength !== arguments[index].length) {
            throw new RangeError("Array lengths do not match.");
        }
    }

    while (arrLength) {
        rnd = Math.floor(Math.random() * arrLength);
        arrLength -= 1;
        for (let argsIndex = 0; argsIndex < argsLength; argsIndex += 1) {
            tmp = arguments[argsIndex][arrLength];
            arguments[argsIndex][arrLength] = arguments[argsIndex][rnd];
            arguments[argsIndex][rnd] = tmp;
        }
    }
}

function createCards(numCards) {
    let images = [
        "01.jpg",
        "c.jpg",
        "02.jpg",
        "f.jpg",
        "03.jpg",
        "j.jpg",
        "04.jpg",
        "a.jpg",
        "05.jpg",
        "b.jpg",
        "06.jpg",
        "h.jpg",
        "07.jpg",
        "g.jpg",
        "08.jpg",
        "e.jpg",
        "09.jpg",
        "i.jpg",
        "10.jpg",
        "d.jpg",
    ];

    let keys = [
        "dunluce_castle",
        "dunluce_castle",
        "huntington_castle",
        "huntington_castle",
        "dungaire_castle",
        "dungaire_castle",
        "the_rock_of_cashel",
        "the_rock_of_cashel",
        "kilchurn_castle",
        "kilchurn_castle",
        "dunnottar_castle",
        "dunnottar_castle",
        "caerlaverock_castle",
        "caerlaverock_castle",
        "st_andews_castle",
        "st_andews_castle",
        "donegal_castle",
        "donegal_castle",
        "blackness_castle",
        "blackness_castle",
    ];

    multishuffle(images, keys);

    let cards = Array(numCards);
    let rows = Math.floor(Math.sqrt(numCards));
    let cols = Math.ceil(numCards * 1.0 / rows);

    // The largest row values is going to be (rows - 1) / rows, thus we can move everything by 1 / (rows / 2)
    let rowOffset = 1.0 / (rows * 2.0);
    let colOffset = 1.0 / (cols * 2.0);

    // x and y are going to be the center coordinates
    for (let i = 0; i < numCards; i++) {
        let row = Math.floor(i / cols);
        let col = i % cols;
        cards[i] = {
            x: col * 1.0 / cols + colOffset,
            y: row * 1.0 / rows + rowOffset,
            rotation: Math.round(Math.random() * 20) - 10,
            matchKey: keys[i],
            imgUrl: images[i],
        };
    }
    return cards;
}