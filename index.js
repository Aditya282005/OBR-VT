require("dotenv").config();
const { tool }=require("@langchain/core/tools");
const { z }=require("zod");
const express=require("express");
const app=express();
const path=require("path");
 app.set("view engine","ejs");
 app.set("views",path.join(__dirname,"views"));
 app.use(express.static("public"));
 
 //console.log(process.env.GROQ_API_KEY)
 

const{ChatGroq}=require("@langchain/groq");
const{createAgent, modelRetryMiddleware, summarizationMiddleware}=require("langchain");
const{MemorySaver}=require("@langchain/langgraph");
const model= new ChatGroq({
  model:"openai/gpt-oss-20b",
  apiKey:process.env.GROQ_API_KEY,
 
});



const getweather=tool(({city}) =>{return `the weather in ${city} is sunny`;},
{

  name:"getweather",
  description:"get the weather of the city",
  schema:z.object({
    city:z.string()
  })
}
);
const agent=createAgent({
  model:model,
 tools:[getweather],
 systemPrompt:"you are a helpful agent"

});

async function runagent(){
const response=await agent.invoke({
  messages:[{
    role:"user",
    content:"what is the weather in new york"
  }
  ]
});
console.log(response.messages[response.messages.length-1].content);}
//runagent();


async function runmodel(){
  const res=await model.invoke("why do parrot talk?");
  console.log(res.content);
}
// runmodel();

async function run(){
  const stream= await model.stream("write about ai");
  let answer="";
  for await(const chunk of stream){
  process.stdout.write(chunk.content)}
}

//run();
async function batchh(){
  const requests=await model.batch([
    "what is ai,answer in 1 sentence",
    "what is aeroplane,answer in 1 sentence",
    "what is mother,answer in 1 sentence"
  ]);
  for( const request of requests){
    console.log(request.content);
  }
}
//batchh();

const Person=z.object({
  name:z.array(z.string()),
  age:z.number()
});
const structuredmodel=model.withStructuredOutput(Person);

async  function modell(){
const response1=await structuredmodel.invoke(" aditya and ritika is a good boy its 21 years old");
console.log(response1);
}
//modell();


//create middleware//
//first require
const checkpointer=new MemorySaver();

const agent1=createAgent({
model,
tool:[],
middleware:[
summarizationMiddleware({
  model,
  trigger:{tokens:100},
  keep:{messages:3}
})],checkpointer
});
const config={
  configurable:{
    thread_id:"1"
  }
};
const question=[
  "what is ai",
   "what is ml",
    "what is use of both",
     "what is disadvantage",
     "explain deep learning",
     "give real world application of ai",
     "compare ai,ml,deep learning"
];

async function midd(){
  for(const q of question){
const response=await agent1.invoke({messages:[{
  role:"user",
  content:q
}]},config);
console.log(response.messages);
console.log(response.messages.length);}}
midd();

app.get("/" , (req,res)=>{
res.render("home.ejs");

});


app.get("/user/:username", (req,res)=>{
    const insta=require("./data.json");
   let {username}=req.params;
    const data=insta[username];
  //  console.log(data);
 
    res.render("instagram.ejs", {data});
});




 const port=8080;
 app.listen(port, ()=>{
console.log("im listening");
 }
);


