let Login = {
    render: async () => 
    {
        return `        <form class="logreg-form">
        <div class="input-wrapper">
          <input type="text" placeholder="Username" id="username" class="logreg-input">
        </div>
        <div class="input-wrapper">
          <input type="password" placeholder="Password" id="password" class="logreg-input">
        </div>
        <button type="submit" class="logreg-button">Login</button>
        <a class="logreg-a" href="#/register">Go to registration</a>
      </form>`
    },

    after_render: async () =>
    {
        function login(e){
          const email = document.querySelector("#username").value;
          const password = document.querySelector("#password").value;
          e.preventDefault();
          firebase.auth().signInWithEmailAndPassword(email, password).then(function(){
              window.location.hash = "/builder";
          }).catch(function(error) {
              alert(error.message);
          });
      }
      
      document.querySelector(".logreg-form").addEventListener("submit", login);
    }
};

export default Login;