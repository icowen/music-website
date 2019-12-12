import React, {Component} from 'react';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import HomePage from "./HomePage";


class App extends Component {
    constructor() {
        super();
        this.state = {model: null}
    }

    async componentDidMount() {
        const model = await tf.loadLayersModel('https://cors-anywhere.herokuapp.com/https://storage.googleapis.com/music-website/model1.json');
        this.setState({model});
    }

    render() {
        return (
            <div className="App">
                <HomePage model={this.state.model}/>
            </div>
        );
    }
}

export default App;
