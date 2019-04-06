import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://burger-builder-e6ee6.firebaseio.com/'
});

export default instance;