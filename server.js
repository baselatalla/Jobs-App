'use strict';

'use strict';

require('dotenv').config();
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');
const methodOverride = require('method-override');
const PORT = process.env.PORT || 6060;
const express = require('express');
const server = express();
const client = new pg.Client(process.env.DATABASE_URL);
server.use(cors());
server.use(express.static('./public'));
server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));
server.set('view engine', 'ejs');

//routs
server.get('/', homehandler);
server.get('/search', searchhandler);
server.post('/searchforjob', searchforjobhandler);
server.post('/add', addhandler);
server.get('/mylist', mylisthandler);
server.get('/detail/:id', detailhandler);
server.put('/update/:id', updatehandler);
server.delete('/delete/:id', deletehandler);



//Handlers
function homehandler(req,res){
  let URL = `https://jobs.github.com/positions.json?location=usa`;
  superagent.get(URL).then((data)=>{
    let jobsArray = data.body.map((ele)=> new Jobs(ele));
    res.render('home', {data: jobsArray});
  }).catch((erorr)=>{
    console.log(erorr);
  });
}


function searchhandler(req,res){
  res.render('search');

}
function searchforjobhandler(req,res){
  let description = req.body.description;
  let URL = `https://jobs.github.com/positions.json?description=${description}&location=usa`;
  superagent.get(URL).then((data)=>{
    let jobsArray = data.body.map((ele)=> new JobsByDeesc(ele));
    res.render('result', {data: jobsArray});
  }).catch((erorr)=>{
    console.log(erorr);
  });

}
function addhandler(req,res){
  let { title,company,location,url,description} = req.body;
  let safevalues = [title,company,location,url,description];
  let SQL = `INSERT INTO usajobs(title,company,location,url,description) VALUES($1,$2,$3,$4,$5) RETURNING *;`;
  client.query(SQL,safevalues).then(()=>{
    res.redirect('/mylist');
  }).catch((erorr)=>{
    console.log(erorr);
  });
}

function mylisthandler(req,res){
  let SQL = `SELECT * FROM usajobs;`;
  client.query(SQL).then((data)=>{
    res.render('mylist', {data: data.rows});
  }).catch((erorr)=>{
    console.log(erorr);
  });
}
function detailhandler(req,res){
  let id = req.params.id;
  let SQL = `SELECT * FROM usajobs WHERE id=$1 ;`;
  client.query(SQL,[id]).then((data)=>{
    res.render('detail', {data: data.rows});
  }).catch((erorr)=>{
    console.log(erorr);
  });
}

function updatehandler(req,res){
  let id = req.params.id;
  let {title,company,location,url,description} = req.body;
  let safevalues = [title,company,location,url,description, id];
  let SQL = `UPDATE usajobs SET title=$1,company=$2,location=$3,url=$4,description=$5 WHERE id=$6;`;
  client.query(SQL,safevalues).then(()=>{
    res.redirect(`/detail/${id}`);
  }).catch((erorr)=>{
    console.log(erorr);
  });
}

function deletehandler(req,res){
  let id = req.params.id;
  let SQL = `DELETE FROM usajobs WHERE id=$1 ;`;
  client.query(SQL,[id]).then(()=>{
    res.redirect('/mylist');
  }).catch((erorr)=>{
    console.log(erorr);
  });
}


//constructers
function Jobs(data){
  this.title = data.title;
  this.company = data.company;
  this.location = data.location;
  this.url = data.url;
}
function JobsByDeesc(data){
  this.title = data.title;
  this.company = data.company;
  this.location = data.location;
  this.url = data.url;
  this.description = data.description;
}


client.connect()
  .then(() => {
    server.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
  });






