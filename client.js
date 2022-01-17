function setStatus(){
  let info = {};

  console.log("setting status");

  let private = document.getElementById("private").value;
  let public = document.getElementById("public").value;

  let ele = document.getElementsByName('status');
  info.name = object;

  if(ele[0].checked){
    info.status = 'private';
  } else if (ele[1].checked){
    info.status = 'public';
  } else {
    info.status = 'no';
  }

  console.log(info);

  let req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      alert("your status was changed");
    }
  }

  req.open("POST", "http://localhost:3000/radio");
  req.setRequestHeader("Content-Type", "application/JSON");
  req.send(JSON.stringify(info));
}
