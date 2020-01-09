import React, {Component} from 'react';
import '../App.css';
import * as tf from '@tensorflow/tfjs';
import HomePage from "./HomePage";


class App extends Component {
    constructor() {
        super();
        this.state = {model: null, untrainedModel: null}
    }

    async componentDidMount() {
        const model = await tf.loadLayersModel('https://cors-anywhere.herokuapp.com/https://storage.googleapis.com/music-website/model1.json');
        const untrainedModel = await tf.loadLayersModel('https://cors-anywhere.herokuapp.com/https://storage.googleapis.com/music-website/model_untrained.json');
        this.setState({model, untrainedModel});
    }

    render() {
        return (
            <div className="App">
                <HomePage model={this.state.model}
                          untrainedModel={this.state.untrainedModel}/>
            </div>
        );
    }
}

export default App;
