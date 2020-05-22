import Login from "./login.js";
import Register from "./register.js";
import Builder from "./builder.js";
import Solver from "./solver.js";

const routes = {
    '/'                : Login,
    '/login'           : Login,
    '/builder'         : Builder,
    '/solver/:id'      : Solver,
    '/register'        : Register
};


const router = async () => {

    const content = null || document.getElementById('subbody');

    let request = parseRequestURL()
    let parsedURL = (request.resource ? '/' + request.resource : '/') + (request.id ? '/:id' : '');
    let page = routes[parsedURL];
    content.innerHTML = await page.render();
    await page.after_render(request.id);

}


// Listen on hash change:
window.addEventListener('hashchange', router);

// Listen on page load:
//window.addEventListener('load', router);
window.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
            window.location.hash = '/builder';
        } else {
            window.location.hash = '/';
        }
        router();
    }); 
});

function parseRequestURL(){

    let url = location.hash.slice(1) || '/';
    let r = url.split("/")
    let request = {
        resource    : null,
        id          : null
    }
    request.resource    = r[1]
    request.id          = r[2]

    return request
}
