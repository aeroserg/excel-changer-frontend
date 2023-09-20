if (localStorage.getItem('sessionToken') !== null) {
    localStorage.removeItem('sessionToken');
}

const BASE_HOST_AUTH = location.protocol + '//' + location.host;
const HOST_AUTH = BASE_HOST_AUTH.replace(':8080', ':8000');


function getCookie(cookieName) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === cookieName) {
            return decodeURIComponent(value);
        }
    }
    return null;
}

$(document).ready(function(){
    $('form').on('submit', function(event){
        event.preventDefault();
        const username = $('#username').val();
        const password = $('#password').val();
        $.ajax({
                type: "POST",
                url: HOST_AUTH + '/api/auth_user/',
                data: {"username": username, "password": password},
            
                success: function(data) {
                    if(data.success == false) {
                        alert('введены неправильный логин или пароль');
                    } else if (data.token) {
                        const sessionToken = data.token;
                    localStorage.setItem('sessionToken', sessionToken); 
                    window.location.replace(BASE_HOST_AUTH + '/accounts/');
                    }
                    
                },
                error: function(xhr,status,error) {
                    alert(error);
                }
        })
    })
})
