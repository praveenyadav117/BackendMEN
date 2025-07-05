// console.log("test");
const url = "https://dummyjson.com/users";

function fetchData(url,callback){
   fetch(url)
   .then(response=>{
        // console.log("prinitng data55",response);
       if(!response.ok){
           throw new Error("502 error");
       }
       return response.json();
   })
   .then(data=>{
    //    console.log("prinitng data",data);
       callback(null,data);
   })
   .catch(error=>{
       console.log("prinitng dat55a",error);
       callback(error,null);
   })
}

fetchData(url,function(error,data){
    if(error){
        console.log("error:",error);
    }else{
        console.log("Data:",data);
    }
});