let Register = {
    render : async () =>{
        return `        <form class="logreg-form">
        <div class="input-wrapper">
            <input type="text" placeholder="Username" id="username" class="logreg-input">
        </div>
        <div class="input-wrapper">
            <input type="password" placeholder="Password" id="password" class="logreg-input">
        </div>
        <div class="input-wrapper">
            <input type="password" placeholder="Confirm Password" id="password2" class="logreg-input">
        </div>
        <button type="submit" class="logreg-button">Signin</button>
        <a class="logreg-a" href = "#/">login</a>
    </form>`
    },

    after_render: async () =>
    {
        function register(e){
            const email = document.querySelector("#username").value;
            const password = document.querySelector("#password").value;
            const password2 = document.querySelector("#password2").value;
            if(password != password2)
            {
                alert("Passwords are not equal(");
                return;
            }
            e.preventDefault();
            firebase.auth().createUserWithEmailAndPassword(email, password).then(function(userdata){
                console.log(userdata);
                window.location.hash = "/builder";
            }).catch(function(error) {
                alert(error.message);
            });
        }
         
        document.querySelector(".logreg-form").addEventListener("submit", register);
    }
};

export default Register;