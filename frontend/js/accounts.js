if (localStorage.getItem("sessionToken") == null) {
    location.replace('/')
}

const BASE_HOST_ACCOUNTS = location.protocol +'//' + location.host;
const HOST = BASE_HOST_ACCOUNTS.replace(':8080', ':8000');

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
                    accountsListHTML += `<div class="list_item_acc" data-id="${data[i].id}">
                    <div class="name_row d-flex">
                        <div class="static_signature">Имя: </div>
                        <div class="item_name ml-1">${data[i].account_name}</div>
                    </div>
                   
                    <input class="form_control_item_editing d-none" value="${data[i].account_name}">
                    <div class="item_control_container">
                        <div class="item_delete item_control"></div>
                        <div class="item_edit item_control"></div>
                        <div class="done_item_sign d-none"></div>
                    </div>
                </div>`
                }
                document.querySelector('.accounts_list').innerHTML = accountsListHTML;
            }
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
  
        const BASE_HOST = location.protocol + '//' + location.host
            // настройки ajax для получение токена
            $.ajaxSetup({
                beforeSend: function(xhr, settings) {
                    if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                    }
                },
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    Authorization: "Token " + token,
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
                // редактирование аккаунта
                $(".item_edit").off('click').on('click', function() {
                    const fullAccountRow = $(this).closest(".list_item_acc");
                    const itemsToToggleHide = [fullAccountRow.find(".item_edit"),fullAccountRow.find(".done_item_sign"),fullAccountRow.find(".form_control_item_editing"), fullAccountRow.find('.item_name')]
                    itemsToToggleHide.map((el) => {el.toggleClass("d-none")});
                });
                $('.done_item_sign').off('click').on('click', function() {
                $('.loader').toggleClass('d-block');
                    const fullAccountRow = $(this).closest(".list_item_acc");
                    const newNameInputValue = fullAccountRow.find(".form_control_item_editing").val().trim();
                    const accountId = parseInt($(this).closest('.list_item_acc').data('id'));
                    const dataObj = { "id": accountId, "account_name": newNameInputValue };
                    $.ajax({
                        type: "POST",
                        url: HOST + '/api/refactor_account/',
                        data: JSON.stringify(dataObj),
                        contentType: "application/json; charset=utf-8", 
                        success: function(data) {
                            if(data.success == true) {
                            // alert("It worked");
                                $('.loader').toggleClass('d-block');
                                fullAccountRow.find('.item_name').text(newNameInputValue);
                                const itemsToToggleHide = [fullAccountRow.find(".item_edit"),fullAccountRow.find(".done_item_sign"),fullAccountRow.find(".form_control_item_editing"), fullAccountRow.find('.item_name')]
                                itemsToToggleHide.map((el) => {el.toggleClass("d-none")});
                            }
                            else if (data.success == false) {
                                alert("Пользователь уже существует или было задано пустое значение");
                                fullAccountRow.find(".form_control_item_editing").val('');
                                $('.loader').toggleClass('d-block');
                                const itemsToToggleHide = [fullAccountRow.find(".item_edit"),fullAccountRow.find(".done_item_sign"),fullAccountRow.find(".form_control_item_editing"), fullAccountRow.find('.item_name')]
                                itemsToToggleHide.map((el) => {el.toggleClass("d-none")});
                            }
                        },
                        error: function(xhr, status, error) {
                            console.log(xhr,status, error)
                            alert("Что-то пошло не так!");
                            $('.loader').toggleClass('d-block');
                            fullAccountRow.find(".form_control_item_editing").val("");
                            const itemsToToggleHide = [fullAccountRow.find(".item_edit"),fullAccountRow.find(".done_item_sign"),fullAccountRow.find(".form_control_item_editing"), fullAccountRow.find('.item_name')]
                            itemsToToggleHide.map((el) => {el.toggleClass("d-none")});
                        }
                    });
                });
                // удаление аккаунта
                $(".item_delete").off('click').on('click', function() {
                    $('.loader').toggleClass('d-block');
                    const fullAccountRow = $(this).closest(".list_item_acc");
                    const accountName = fullAccountRow.find('.item_name').text();
                    const accountId = parseInt(fullAccountRow.data('id'));
                    const dataObj = { "id": accountId, "account_name": accountName };
                    $.ajax({
                        type: "POST",
                        url: HOST + '/api/delete_account/',
                        data: dataObj,
                        success: function(data) {
                            if(data.success == true) {
                                fullAccountRow.remove();
                                $('.loader').toggleClass('d-block');
                                location.reload();
                            }
                            else if (data.success == false) {
                                $('.loader').toggleClass('d-block');
                                alert("Пользователь не удален:(");
                                
                            }
                        },
                        error: function(xhr, status, error) {
                            console.log(xhr,status, error)
                            alert("Что-то пошло не так!");
                            $('.loader').toggleClass('d-block');
                            fullAccountRow.find(".form_control_item_editing").val("");
                            const itemsToToggleHide = [fullAccountRow.find(".item_edit"),fullAccountRow.find(".done_item_sign"),fullAccountRow.find(".form_control_item_editing"), fullAccountRow.find('.item_name')]
                            itemsToToggleHide.map((el) => {el.toggleClass("d-none")});
                        }

                    });
                });
            //добавление новых аккаунтов
                $(".add_account").off('click').on('click', function(){
                    $('.modal_add_account').toggleClass('d-block');          
                    $('.add_account_to_list').off('click').on('click', function(){
                        const newAccountName = $('.account_push').val().trim();
                            $('.loader').toggleClass('d-block');
                            const dataObj = {"account_name": newAccountName};
                            $.ajax({
                                type: "POST",
                                url: HOST + '/api/add_account/',
                                data: dataObj,
                                success: function(data) {
                                        const accountsList = $('.accounts_list');
                                        const newAccount = `<div class="list_item_acc" data-id="${data.id}"><div class="name_row d-flex"><div class="static_signature">Имя: </div> <div class="item_name ml-1">${data.account_name}</div></div><input class="form_control_item_editing d-none" value=""><div class="item_control_container"><div class="item_delete item_control"></div><div class="item_edit item_control"></div><div class="done_item_sign d-none"></div></div></div>`;
                                        accountsList.append(newAccount);
                                        location.reload();
                                },
                                error: function(xhr, status, error) {
                                    console.log(xhr,status, error)
                                    if (xhr.responseJSON.account_name[0] == 'account with this account name already exists.') {
                                        $('.add_account_to_list').text('Пользователь уже существует!');
                                        setTimeout(function() {$('.add_account_to_list').text('Добавить')}, 2000)                     
                                        $('.loader').toggleClass('d-block');
                                       //$('.modal_add_account').toggleClass('d-block');
                                    } else if (xhr.responseJSON.account_name[0] == 'This field may not be blank.') {
                                        $('.add_account_to_list').text('Имя Аккаунта не может быть пустым');
                                        setTimeout(function() {$('.add_account_to_list').text('Добавить')}, 2000)
                                         $('.loader').toggleClass('d-block');
                                    }
                                    else {
                                        alert("Что-то пошло не так!");
                                        $('.loader').toggleClass('d-block');
                                    }
                                }
                            });
                    });
                });
                // открытие/закрытие модальных окон
                $('[data-content="closeX"]').off('click').on('click', function(){ 
                    $(this).closest('.modal').toggleClass('d-block');
                });
            });

};
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
const sessionToken = localStorage.getItem('sessionToken');
gatherData(HOST + '/api/get_accounts/', sessionToken);
