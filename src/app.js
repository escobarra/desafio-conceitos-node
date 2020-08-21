const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];// Store repo's without persistence

//Create a Middleware to validate UUID
function validadeRepoID(request, response, next)
{
  const {id} = request.params;

  if(!isUuid(id))
  {
    return response.status(400).json({error:'Invalid Repository UUID.'}); //return a bad request
  }
  return next();
}

function logRequests(request,response, next)
{
  const {method,url} = request;

  const logLabel = `\x1b[32m[${method.toUpperCase()}] \x1b[0m  ${url}`;

  console.time(logLabel);

  next();

  console.timeEnd(logLabel);

}
app.use(logRequests);
app.use('/repositories/:id', validadeRepoID);


//
function searchIndex(id,response)
{
  const repoIndex = repositories.findIndex(project=> project.id === id);
  if(repoIndex < 0 )
  {
    return response.status(400).json({error:'Repository not found.'});
  }
  return repoIndex;
}

app.get("/repositories", (request, response) => {

  return response.status(200).json(repositories); //List repos

});

app.post("/repositories", (request, response) => {
  const {title, url, techs} = request.body;

  const repo = {id:uuid(),title, url, techs, likes:0} //when created has no like 

  repositories.push(repo);

  return response.status(201).json(repo); //HTTP code created returned

 });


app.put("/repositories/:id", (request, response) => {
  const {id} = request.params;
  const {title, url, techs} = request.body;
  const repoIndex = searchIndex(id,response);
  const repository = repositories[repoIndex];
  repository.title = title;
  repository.url = url;
  repository.techs = techs;

  repositories[repoIndex] = repository;
  return response.status(200).json(repository);
  
});

app.delete("/repositories/:id", (request, response) => {
  const {id} = request.params;
  const repoIndex = searchIndex(id,response);
  
  repositories.splice(repoIndex,1);//deleta do repositório

  return response.status(204).send();

});

app.post("/repositories/:id/like", (request, response) => {
  const {id} = request.params;
  const repoIndex = searchIndex(id,response);
  repositories[repoIndex].likes += 1;
  return response.status(200).json(repositories[repoIndex]); //Http no content code
});

module.exports = app;
