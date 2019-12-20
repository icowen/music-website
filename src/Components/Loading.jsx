import React from 'react';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'

export default class Loading extends React.Component {
    render() {
        return (
            <Loader
                type="Audio"
                color="#00BFFF"
                height={200}
                width={200}
            />
        );
    }
}