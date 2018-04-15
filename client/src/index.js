import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Card(props) {
    let style = {
        top: props.y,
        left: props.x,
        transform: `rotate( ${props.rotation}deg )`,
    };

    return (
        <div
            className="card"
            style={style}
            data-x={props.x}
            data-y={props.y}
            data-rotation={props.rotation}>
            <div className={props.open ? "face flipped" : "face"} onClick={props.onClick}>
                <div className="front">
                    <img src="http://via.placeholder.com/200x200" alt="Bla"/>
                </div>
                <div className="back">
                    <img src="christmas_tree.jpg" alt="Christmas tree" />
                </div>
            </div>
        </div>
    );
}


class CardDeck extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cards: createCards(12)
        };
    }

    handleClick(i) {
        const cards = this.state.cards.slice();
        // Flip open
        cards[i].open = !cards[i].open;
        this.setState({
            cards: cards
        });
    }

    renderCard(i) {
        let card = this.state.cards[i];
        return (
            <Card
                key={i}
                x={card.x * this.props.gameWindowWidth}
                y={card.y * this.props.gameWindowHeight}
                rotation={card.rotation}
                open={card.open}
                onClick={() => this.handleClick(i)}
            />
        );
    }

    render() {
        return (
            <div className="card-deck">
            {
                this.state.cards.map((card, i) => this.renderCard(i))
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
                    gameWindowWidth={this.state.gameWindowWidth}
                    gameWindowHeight={this.state.gameWindowHeight}
                />
            </div>
        );
    }
}

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function createCards(numCards) {
    let cards = Array(numCards);
    let rows = Math.floor(Math.sqrt(numCards));
    let cols = Math.ceil(numCards * 1.0 / rows);
    for (let i = 0; i < numCards; i++) {
        let row = Math.floor(i / cols);
        let col = i % cols;
        cards[i] = {
            x: col * 1.0 / cols,
            y: row * 1.0 / rows,
            rotation: Math.round(Math.random() * 20) - 10,
            open: false,
        };
    }
    return cards;
}