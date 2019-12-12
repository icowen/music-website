import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import HomePage from "./HomePage";


class App extends Component {
    constructor() {
        super();
        this.state = {model: null}
    }

    async componentDidMount() {
        const model = await tf.loadLayersModel('https://cors-anywhere.herokuapp.com/https://storage.googleapis.com/music-website/model.json');
        // let x_train = await fetch('https://cors-anywhere.herokuapp.com/https://storage.googleapis.com/music-website/input_notes.json');
        // let y_train = await fetch('https://cors-anywhere.herokuapp.com/https://storage.googleapis.com/music-website/output_notes.json');
        // x_train = await x_train.json();
        // y_train = await y_train.json();
        //
        // let x = [];
        // for (let i in x_train) {
        //     x.push(x_train[i])
        // }
        // let y = [];
        // for (let i in y_train) {
        //     y.push(y_train[i])
        // }
        // console.error('x[0]:', x[0]);
        // const pred = model.predict(tf.tensor2d(x[0], [1, 256])).print();
        this.setState({model});
    }

    render() {
        return (
            <div className="App">
                {/*<header className="App-header">*/}
                {/*    <img src={logo} className="App-logo" alt="logo"/>*/}
                {/*    <p>*/}
                {/*        Edit <code>src/App.js</code> and save to reload.*/}
                {/*    </p>*/}
                {/*    <a*/}
                {/*        className="App-link"*/}
                {/*        href="https://reactjs.org"*/}
                {/*        target="_blank"*/}
                {/*        rel="noopener noreferrer"*/}
                {/*    >*/}
                {/*        Learn React*/}
                {/*    </a>*/}
                {/*</header>*/}
                <HomePage model={this.state.model}/>
            </div>
        );
    }
}

export default App;
