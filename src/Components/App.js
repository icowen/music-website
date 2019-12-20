import React, {Component} from 'react';
import '../App.css';
import * as tf from '@tensorflow/tfjs';
import HomePage from "./HomePage";


class App extends Component {
    constructor() {
        super();
        this.state = {model: null, untrained_model: null}
    }

    async componentDidMount() {
        const model = await tf.loadLayersModel('https://cors-anywhere.herokuapp.com/https://storage.googleapis.com/music-website/model2.json');
        const untrained_model = await tf.loadLayersModel('https://cors-anywhere.herokuapp.com/https://storage.googleapis.com/music-website/model_untrained.json');
        this.setState({model, untrained_model});
    }

    render() {
        return (
            <div className="App">
                <HomePage model={this.state.model}
                          untrained_model={this.state.untrained_model}/>
            </div>
        );
    }
}

export default App;
