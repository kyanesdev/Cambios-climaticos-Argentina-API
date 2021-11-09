const PORT =  process.env.PORT || 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const {response} = require("express");

const app = express();

const articles = [];
const climas = [
    {
        name: 'cadena3',
        address: 'https://www.cadena3.com/pagina/clima',
        base: ''
    },
    {
        name: "lavoz",
        address: 'https://www.lavoz.com.ar/clima/',
        base: 'https://www.lavoz.com.ar'
    },
    {
        name: "tiempo3",
        address: 'https://www.tiempo3.com/south-america/argentina',
        base: ''
    },
    {
        name: "clarin",
        address: 'https://www.clarin.com/clima',
        base: ''
    }
];

climas.forEach(newspaper => {
    axios.get(newspaper.address)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html); //Sirve para ubicar tags en un html
            $('a:contains("Clima")', html).each(function () { //Recibe 2 parametros, el primero busca las tags que contengan ese "Clima" y el segundo le pasas a donde tiene que buscar eso
                const title = $(this).text()      //Por otra parte el each lo que hace es recorrer elementos del DOM
                const url = $(this).attr('href')

                articles.push({
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name
                })

            })
        }).catch((err) => console.log(err))
})

app.get('/', (req, res) => {
    res.json('Bienvenido a mi API de Cambios Climáticos en la Argentina provistos por las paginas mas conocidas del pais');
})

app.get('/clima', (req, res) => {
    res.json(articles);
})

app.get('/clima/:climaID', (req, res) => {
    const climaID = req.params.climaID;

    const clima = climas.filter(clima => clima.name == climaID)[0].address;
    const climaBase = climas.filter(clima => clima.name == climaID)[0].address;

    axios.get(clima)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html)
            const specificArticles = []

            $('a:contains("Clima")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
                specificArticles.push({
                    title,
                    url: climaBase + url,
                    source: climaID
                })
            })
            res.json(specificArticles)
        }).catch((err) => console.log(err))

})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

