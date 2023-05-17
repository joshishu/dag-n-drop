const yaml = require('js-yaml');
const express = require('express');
const app = express();
const port = 8080;

app.use(express.static('static'));
app.use(express.json());

app.post('/convert', (req, res) => {
    console.log('Converting: ' + JSON.stringify(req.body));
    const yamlString = yaml.dump(req.body);
    console.log('converted: ' + yamlString)
    res.send(yamlString);
})

app.listen(port, () => console.log(`App listening on ${port}`));
