if (localStorage.getItem("sessionToken") == null) {
    location.replace('/')
}
const BASE_HOST_COLLLECTADDR= location.protocol +'//' + location.host;
const HOST_COLLLECTADDR = BASE_HOST_COLLLECTADDR.replace(':8080', ':8000');
const sessionTokenSecondary = localStorage.getItem('sessionToken');
async function gatherData(url, token, data = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Token ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            
            if (url.includes('get_accounts')) {
                let accountsListHTML = '';
                for (let i = 0; i < data.length; i++){
                   
                        const params = new Proxy(new URLSearchParams(window.location.search), {
                            get: (searchParams, prop) => searchParams.get(prop),
                        });
                        let value = params.account_name;
                        if (data[i].account_name === value) {
                            accountsListHTML += `<option selected="selected" value="${data[i].account_name}" data-id="${data[i].id}">${data[i].account_name}</option>`
                        } else {
                            accountsListHTML += `<option value="${data[i].account_name}" data-id="${data[i].id}">${data[i].account_name}</option>`;
                        }
                }
                document.querySelector('select').innerHTML = accountsListHTML;
            }
           
                    
                    $.ajaxSetup({
                        beforeSend: function(xhr, settings) {
                            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                                
                            }
                        },
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken'),
                            Authorization: "Token " + sessionTokenForCollectaddress,
                        }
                    });

                    function getCookie(name) {
                        let cookieValue = null;
                        if (document.cookie && document.cookie !== '') {
                            const cookies = document.cookie.split(';');
                            for (let i = 0; i < cookies.length; i++) {
                                const cookie = cookies[i].trim();
                                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                                    break;
                                }
                            }
                        }
                        return cookieValue;
                    }
                    $(document).ready(function() {
                        $('.loader').toggleClass('d-block');
                       $('.form_select_account').on('submit', function(e){
                        e.preventDefault();
                        const accountName = $('select').find(":selected").text();
                        const googleLink = $('.form_google_link').val().trim();
                        const columnToChange = $('.form_column_change').val().trim();
                         if (accountName && googleLink && columnToChange){
                            $('.loader').toggleClass('d-block');
                            const dataObj = {
                                "account": accountName,
                                "link": googleLink,
                                "column_name": columnToChange
                              }
                            $.ajax({
                                type: "POST",
                                url: HOST_COLLLECTADDR + '/api/google_link/',
                                data: JSON.stringify(dataObj),
                                contentType: "application/json; charset=utf-8", 
                                success: function(data) {
                                    if(data.success == true) {
                                        $('.btn_submit').toggleClass('d-none');
                                        $('.sucsess_message').toggleClass('d-none')
                                        $('.loader').toggleClass('d-block');
                                        setTimeout(function() {$('.sucsess_message').toggleClass('d-none'); $('.btn_submit').toggleClass('d-none');}, 2000)  
                                    }
                                    else if (data.success == false) {
                                        alert("Неверно указаны данные для гугл таблиц или превышен лимит запросов");
                                        $('.loader').toggleClass('d-block');
                                    }
                                },
                                error: function(xhr, status, error) {
                                    console.log(xhr,status, error)
                                    alert("Что-то пошло не так!");
                                    $('.loader').toggleClass('d-block');
                                }
                            });
                         }
                       })
                    })
            
        }else if (response.status === 401) {
                if (localStorage.getItem('sessionToken') !== '' || localStorage.getItem('sessionToken') !== null || localStorage.getItem('sessionToken') !== undefined) {
                    localStorage.removeItem('sessionToken');
                    location.replace('/');
                }
                location.replace('/');
               
        } else {
            console.log('Error:', response.statusText);
            if (localStorage.getItem('sessionToken') !== '' || localStorage.getItem('sessionToken') !== null || localStorage.getItem('sessionToken') !== undefined) {
                localStorage.removeItem('sessionToken');
                location.replace('/');
            }
            location.replace('/');
        }
    } catch (error) {
        console.error('An error occurred:', error);
        if (localStorage.getItem('sessionToken') !== '' || localStorage.getItem('sessionToken') !== null || localStorage.getItem('sessionToken') !== undefined) {
            localStorage.removeItem('sessionToken');
            location.replace('/');
       }
       location.replace('/');
    }
   
}
const sessionTokenForCollectaddress = localStorage.getItem('sessionToken');
gatherData(HOST_COLLLECTADDR     + '/api/get_accounts/', sessionTokenForCollectaddress);
