if (localStorage.getItem("sessionToken") == null) {
    location.replace('/')
}

const BASE_HOST_APP = location.protocol +'//' + location.host;
const HOST_ADDR = BASE_HOST_APP.replace(':8080', ':8000');
const sessionTokenAddress = localStorage.getItem('sessionToken');

// const allCityPagesData = {};
// sessionStorage.setItem('allCityPagesData', JSON.stringify(allCityPagesData));
// sessionStorage.getItem('URLParamsForPagination');
function getAccountURLValue() {
    const params = new Proxy(new URLSearchParams(location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    if (params.account_name && params.account_name !== '') {
        let value = params.account_name
        return value;
    }
    return 'all_accounts';
    
}
function storeScrollPosition() {
    var scrollPositionX = window.scrollX;
    var scrollPositionY = window.scrollY;
    localStorage.setItem('scrollPositionX', scrollPositionX);
    localStorage.setItem('scrollPositionY', scrollPositionY);
  }
function scrollToStoredPosition() {
  var storedPositionX = localStorage.getItem('scrollPositionX');
  var storedPositionY = localStorage.getItem('scrollPositionY');

  if (storedPositionX !== null || storedPositionY !== null) {
    window.scrollTo(storedPositionX, storedPositionY);
    localStorage.removeItem('scrollPositionX');
    localStorage.removeItem('scrollPositionY');
  }
}
let dataToSend = {};

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
                    if (location.search !== '' && location.search.includes('account_name')){
                        const params = new Proxy(new URLSearchParams(window.location.search), {
                            get: (searchParams, prop) => searchParams.get(prop),
                        });
                        let value = params.account_name;
                        if (data[i].account_name === value) {
                            if(i == 0) {
                                accountsListHTML += `<option  value="all_accounts" data-id="all_accounts">Все адреса</option><option selected="selected" value="${data[i].account_name}" data-id="${data[i].id}">${data[i].account_name}</option>`
                            }else {
                                accountsListHTML += `<option selected="selected" value="${data[i].account_name}" data-id="${data[i].id}">${data[i].account_name}</option>`
                            }
                        } else {
                            if(i == 0) {
                                accountsListHTML += `<option value="all_accounts" data-id="all_accounts">Все адреса</option><option value="${data[i].account_name}" data-id="${data[i].id}">${data[i].account_name}</option>`
                            }else {
                                accountsListHTML += `<option value="${data[i].account_name}" data-id="${data[i].id}">${data[i].account_name}</option>`
                            }
                        }
                        
                    } else {
                        if(i == 0) {
                            accountsListHTML += `<option selected="selected" value="all_accounts" data-id="all_accounts">Все адреса</option><option value="${data[i].account_name}" data-id="${data[i].id}">${data[i].account_name}</option>`
                        }else {
                            accountsListHTML += `<option value="${data[i].account_name}" data-id="${data[i].id}">${data[i].account_name}</option>`
                        }
                    }
                   

                }
                document.querySelector('select').innerHTML = accountsListHTML;
            }
            else if (url.includes('address')){
                let addressCardHTML = '';
                for (const city in data) {
                    const cityData = data[city];
                    const cityName = city;
                   
                    addressCardHTML += `<div class="adress_city">
                                                <div class="city_name "><div class="city_name_word " >Город: ${cityName}</div>
                                                    <input class="adress_text city_input d-none form_control_item_editing" value="${cityName}">
                                                    <div class="adress_controls d-none">
                                                        <div class="item_edit"></div>
                                                        <div class="item_delete_chekbox_container ">
                                                            <input type="checkbox" name="check_all" class="check_all" id="check_all">
                                                            <label for="check_all"></label>
                                                        </div>
                                                        <div class="done_item_sign d-none"></div>
                                                    </div>
                                                </div>
                                            
                                                <div class="item_check_all_container d-none">
                                                    <input type="checkbox" name="check_all" class="check_all" id="check_all">
                                                    <label>Отметить все</label>
                                                </div>
                                                <div class="city_table">`;
                        var currentPageint = cityData.current_page;
                        dataToSend[`${cityName}`] = currentPageint;
                        
                        cityData.addresses.forEach((item, index) => {
                           
                            addressCardHTML += `<div class="row_adress_item" data-id="${item.id}">
                                                    <div class="start_label ${item.start === true && (!location.search.includes('account_name=all_accounts') || location.search !== '?' || location.search.length !== 0) ? 's-active' : ''}">START</div>
                                                    <div class="center_part_of_row min_width ">
                                                        <div class="adress_text adress_to_choose_for_edit "><span id="indexId">${(currentPageint -1) * 100 + (index + 1)}</span><span class="address_text_string">${item.address}</span></div>
                                                        <input class="adress_text d-none form_control_item_editing" value="${item.address}">
                                                        <div class="used_time"><div class="label_use">USED AT:&nbsp;</div><div class="date_label">${item.time_used ? item.time_used : '0000-00-00'}</div></div>
                                                    </div>
                                                    <div class="right_par_of_row ">
                                                        <div class="adress_controls d-none">
                                                            <div class="item_edit"></div>
                                                            <div class="item_delete_chekbox_container">
                                                                <input type="checkbox" name="delete_chek" class="item_delete_chekbox_for_id" id="delete_chek">
                                                            </div>
                                                            <div class="done_item_sign d-none"></div>
                                                        </div>
                                                    </div>
                                                </div>`;
                        })
                        addressCardHTML += '</div>';
                        if (cityData.pages_amount !== 0) {
                            for (let i = 0; i < cityData.pages_amount; i++) {
                              
                                if (i == 0) {
                                    addressCardHTML += `<div class="b-pageNum"> <div class="b-pageNum-n ${cityData.current_page === i+1 ? 'p-active' : ''}" data-page="${i+1}">${i+1}</div>`;
                                    continue;
                                }
                               
                                addressCardHTML += `<div class="b-pageNum-n ${cityData.current_page === i+1 ? 'p-active' : ''}" data-page="${i+1}">${i+1}</div>`;
                            }
                            addressCardHTML += '</div>';
                        }
                        addressCardHTML += '<div class="add_btn add_adresses">&nbsp;&nbsp;Добавить</div></div>';
                       
                }
                document.querySelector('.adresses_container').innerHTML = addressCardHTML;
                document.querySelector('.adresses_container').innerHTML += '<div class="last_section_in_adresses"><div class="add_city add_btn">&nbsp;&nbsp;&nbsp;Город</div>';
                sessionStorage.setItem('URLParamsForPagination', JSON.stringify(dataToSend));

                    // настройки ajax для получение токена
                    $.ajaxSetup({
                        beforeSend: function(xhr, settings) {
                            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                                
                            }
                        },
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken'),
                            Authorization: "Token " + sessionTokenAddress,
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

                        scrollToStoredPosition()
                       
                        $('.loader').toggleClass('d-block');
                        $('.enter_edits').off('click').on('click', function(){
                            $('.loader').toggleClass('d-block');
                            const arrToMap = [$('.b-pageNum'),$('.item_check_all_container'),$('.adress_controls'),$('.exit_edits'),$('.enter_edits'),$('.delete_controls_container'),$('.add_btn')];
                            arrToMap.map((el) => {el.toggleClass('d-none')});
                            // $('.adresses_container').toggleClass('pt-10');
                            $('.center_part_of_row').toggleClass('min_width');
                            $('.loader').toggleClass('d-block');
                            $(".check_all").change(function() {
                                const isChecked = $(this).is(":checked");
                                const thisCity = $(this).closest('.adress_city');
                                thisCity.find(".item_delete_chekbox_for_id").prop("checked", isChecked);
                            });
                            $('.city_name .item_edit').off('click').on('click', function() {
                                const thisCity = $(this).closest('.adress_city');
                        
                                const arrToMap = [ thisCity.find('.city_name .item_edit'),thisCity.find('.city_name_word'),thisCity.find('.city_input'),thisCity.find('.city_name .done_item_sign')];
                                arrToMap.map((el) => {el.toggleClass('d-none')});
                                thisCity.find('.city_name .done_item_sign').off('click').on('click', function() {
                                    const fullcityNameRow = thisCity.find('.city_name');
                                    const prevCityName = thisCity.find('.city_name_word').text().replace('Город: ','');
                                    const newNameInputValue = fullcityNameRow.find(".form_control_item_editing").val().trim();
                                    const dataObj =
                                    {
                                        "old_city_name": prevCityName,
                                        "new_city_name": newNameInputValue
                                    };
                                    $('.loader').toggleClass('d-block');
                                    $.ajax({
                                        type: "POST",
                                        url: HOST_ADDR + '/api/refactor_city/',
                                        data: dataObj,
                                        success: function(data) {
                                            if(data.success == true) {
                                                $('.loader').toggleClass('d-block');
                                                fullcityNameRow.find('.city_name_word').text("Город: " + newNameInputValue);
                                                const itemsToToggleHide = [fullcityNameRow.find(".item_edit"),fullcityNameRow.find(".done_item_sign"),fullcityNameRow.find(".form_control_item_editing"), fullcityNameRow.find('.city_name_word')]
                                                itemsToToggleHide.map((el) => {el.toggleClass("d-none")});
                                                Object.defineProperty(dataToSend, newNameInputValue,
                                                    Object.getOwnPropertyDescriptor(dataToSend, prevCityName));
                                                delete dataToSend[prevCityName];
                                                sessionStorage.setItem('URLParamsForPagination', JSON.stringify(dataToSend));
                                            }
                                            else if (data.success == false) {
                                                alert("Город уже существует или было задано пустое значение");
                                                const itemsToToggleHide = [fullcityNameRow.find(".item_edit"),fullcityNameRow.find(".done_item_sign"),fullcityNameRow.find(".form_control_item_editing"), fullcityNameRow.find('.city_name_word')]
                                                itemsToToggleHide.map((el) => {el.toggleClass("d-none")});
                                            }
                                        },
                                        error: function(xhr, status, error) {
                                            console.log(xhr,status, error)
                                            alert("Город уже существует или было задано пустое значение");
                                            $('.loader').toggleClass('d-block');
                                            fullcityNameRow.find(".form_control_item_editing").val("");
                                            const itemsToToggleHide = [fullcityNameRow.find(".item_edit"),fullcityNameRow.find(".done_item_sign"),fullcityNameRow.find(".form_control_item_editing"), fullcityNameRow.find('.city_name_word')]
                                            itemsToToggleHide.map((el) => {el.toggleClass("d-none")});
                                        }
                                    });
                                });
                            
                                
                            });  
                        });
                        $('.start_label').off('click').on('click', function(){
                            $('.loader').toggleClass('d-block');
                                const accountId = parseInt($('select').find(":selected").data('id'));
                                const addressId = parseInt($(this).closest('.row_adress_item').data('id'));
                                const thisAddress = $(this).closest('.row_adress_item');
                                const thisCity = thisAddress.closest('.adress_city');
                                const dataObj = {
                                    "account_name": accountId,
                                    "address": addressId
                                }
                                $.ajax({
                                    type: "POST",
                                    url: HOST_ADDR + '/api/reset_start/',
                                    data: dataObj,
                                    success: function(data) {
                                        if(data.success == true) {
                                            thisCity.find('.s-active').removeClass('s-active');
                                            thisAddress.find('.start_label').addClass('s-active');
                                           
                                           $('.loader').toggleClass('d-block');
                                        }
                                        else if (data.success == false) {
                                            alert("Нельзя обновить старт для этого аккаунта");
                                            $('.loader').toggleClass('d-block');
                                        }
                                    },
                                    error: function(xhr, status, error) {
                                        console.log(xhr,status, error)
                                        alert("Нельзя обновить старт для этого аккаунта");
                                        $('.loader').toggleClass('d-block');
                                    }
                                });
      
                        
                        });
                        $('.item_edit').off('click').on('click', function() {
                            const thisAdress = $(this).closest('.row_adress_item');
                            const itemsToToggleHide = [thisAdress.find(".item_edit"),thisAdress.find(".done_item_sign"),thisAdress.find(".form_control_item_editing"), thisAdress.find('.adress_to_choose_for_edit')]
                            itemsToToggleHide.map((el) => {el.toggleClass("d-none")});
                            thisAdress.find(".done_item_sign").off('click').on('click', function() {
                                $('.loader').toggleClass('d-block');
                                const thisAdressId = parseInt(thisAdress.data('id'));
                                const newAdressName = thisAdress.find(".form_control_item_editing").val().trim();
                                const accountId = parseInt($('select').find(":selected").data('id'));
                                if (Number.isNaN(accountId)) {
                                    const dataObj = {"address_id": thisAdressId, "new_address": newAdressName};
                                    $.ajax({
                                        type: "POST",
                                        url: HOST_ADDR + '/api/refactor_address_for_all_accounts/',
                                        data: dataObj,
                                        success: function(data) {
                                           if(data.success == true ) {
                                                    storeScrollPosition();
                                                    location.reload();
                                                    $('.loader').toggleClass('d-block');

                                                }
                                            else if (data.success == false) {
                                                alert("Такой адрес уже существует");
                                                $('.loader').toggleClass('d-block');
                                            }
                                        },
                                        error: function(xhr, status, error) {
                                            console.log(xhr,status, error)
                                            alert("Такой адрес уже существует");
                                            $('.loader').toggleClass('d-block');
                                        }
                                    });
                                } else if (!Number.isNaN(accountId)) {
                                    const dataObj = {"address_id": thisAdressId, "new_address": newAdressName, "account_id": accountId};
                                    $.ajax({
                                        type: "POST",
                                        url: HOST_ADDR + '/api/refactor_address_for_account/',
                                        data: dataObj,
                                        success: function(data) {
                                           if(data.success == true ) {
                                                    storeScrollPosition();
                                                    location.reload();
                                                    $('.loader').toggleClass('d-block');

                                                }
                                            else if (data.success == false) {
                                                alert("Такой адрес уже существует");
                                                $('.loader').toggleClass('d-block');
                                            }
                                        },
                                        error: function(xhr, status, error) {
                                            console.log(xhr,status, error)
                                            alert("Такой адрес уже существует, ошибка");
                                            $('.loader').toggleClass('d-block');
                                        }
                                    });
                                }
                            });
                        })
                        $('.delete_for_account').off('click').on('click', function(){
                           
                            const addressesToDeleteForAccount = $('.item_delete_chekbox_for_id:checkbox:checked').closest('.row_adress_item');
                            const citiesToDeleteForAccount = $('.check_all:checkbox:checked').closest('.city_name');
                            let arrayOfAddressForAjax, 
                                arrayOfCitiesForAjax
                            const accountId = parseInt($('select').find(":selected").data('id'));
                            
                            //addresses
                            if (addressesToDeleteForAccount.length !== 0 && !Number.isNaN(accountId)){
                                $('.loader').toggleClass('d-block');
                                arrayOfAddressForAjax = [];
                                for (const item of addressesToDeleteForAccount) {
                                    arrayOfAddressForAjax.push({"address": parseInt(item.attributes['data-id'].nodeValue)});
                                }
                                const dataArr = arrayOfAddressForAjax;
                                $.ajax({
                                    type: "POST",
                                    url: HOST_ADDR + '/api/delete_address_for_account/',
                                    data: JSON.stringify(dataArr),
                                    contentType: "application/json; charset=utf-8", 
                                    success: function(data) {
                                        if(data.success == true) {
                                            $('.loader').toggleClass('d-block');
                                            storeScrollPosition();
                                           location.reload();
                                        }
                                        else if (data.success == false) {
                                            $('.loader').toggleClass('d-block');

                                            alert("Такой адрес уже существует");

                                        }
                                    },
                                    error: function(xhr, status, error) {
                                        console.log(xhr,status, error)
                                        $('.loader').toggleClass('d-block');
                                        alert("Такой адрес уже существует, ошибка");
                                    }
                                });
                            } else if (addressesToDeleteForAccount.length !== 0 && Number.isNaN(accountId)){
                                $('.loader').toggleClass('d-block');
                                arrayOfAddressForAjax = {};
                                arrayOfAddressForAjax.id = 0;
                                arrayOfAddressForAjax.addresses = [];
                                for (const item of addressesToDeleteForAccount) {
                                    arrayOfAddressForAjax.addresses.push({"address": parseInt(item.attributes['data-id'].nodeValue)});
                                }
                                const dataArr = arrayOfAddressForAjax;
                                $.ajax({
                                    type: "POST",
                                    url: HOST_ADDR + '/api/delete_address_for_all_accounts/',
                                    data: JSON.stringify(dataArr),
                                    contentType: "application/json; charset=utf-8", 
                                    success: function(data) {
                                        if(data.success == true) {
                                            $('.loader').toggleClass('d-block');
                                            storeScrollPosition();
                                           location.reload();
                                        }
                                        else if (data.success == false) {
                                            $('.loader').toggleClass('d-block');

                                            alert("Такой адрес уже существует");

                                        }
                                    },
                                    error: function(xhr, status, error) {
                                        console.log(xhr,status, error)
                                        $('.loader').toggleClass('d-block');
                                        alert("Такой адрес уже существует, ошибка");

                                    }
                                });
                            }
                             //cities
                             if (citiesToDeleteForAccount.length !== 0 && !Number.isNaN(accountId)){
                                $('.loader').toggleClass('d-block');
                                arrayOfCitiesForAjax = [];
                                for (const item of citiesToDeleteForAccount) {
                                    arrayOfCitiesForAjax.push({"city_name": item.children[1].value, "account": accountId});
                                    delete dataToSend[`${item.children[1].value}`]
                                }
                                sessionStorage.setItem('URLParamsForPagination', JSON.stringify(dataToSend));
                                const dataArr = arrayOfCitiesForAjax;
                                $.ajax({
                                    type: "POST",
                                    url: HOST_ADDR + '/api/delete_city_for_account/',
                                    data: JSON.stringify(dataArr),
                                    contentType: "application/json; charset=utf-8", 
                                    success: function(data) {
                                        if(data.success == true) {
                                            $('.loader').toggleClass('d-block');
                                           
                                            storeScrollPosition();
                                            location.reload();
                                        }
                                        else if (data.success == false) {
                                            alert("Адрес не удален");
                                            $('.loader').toggleClass('d-block');
                                        }
                                    },
                                    error: function(xhr, status, error) {
                                        console.log(xhr,status, error)
                                        alert("Адрес не может быть удален");
                                        $('.loader').toggleClass('d-block');
                                    }
                                });
                            } else if (citiesToDeleteForAccount.length !== 0 && Number.isNaN(accountId)) {
                                $('.loader').toggleClass('d-block');
                                arrayOfCitiesForAjax = [];
                                
                                for (const item of citiesToDeleteForAccount) {
                                    arrayOfCitiesForAjax.push({"city_name": item.children[1].value});
                                    delete dataToSend[`${item.children[1].value}`]
                                }
                                sessionStorage.setItem('URLParamsForPagination', JSON.stringify(dataToSend));
                                const dataArr = arrayOfCitiesForAjax;
                                $.ajax({
                                    type: "POST",
                                    url: HOST_ADDR + '/api/delete_city_for_all/',
                                    data: JSON.stringify(dataArr),
                                    contentType: "application/json; charset=utf-8", 
                                    success: function(data) {
                                        if(data.success == true) {
                                            $('.loader').toggleClass('d-block');
                                            storeScrollPosition();
                                            location.reload();
                                        }
                                        else if (data.success == false) {
                                            alert("Город не может быть удален");
                                            $('.loader').toggleClass('d-block');
                                        }
                                    },
                                    error: function(xhr, status, error) {
                                        alert("Город не может быть удален, ошибка");
                                        $('.loader').toggleClass('d-block');
                                    }
                                });
                            }
                           
                        })
                        $('.delete_for_all_button').off('click').on('click', function(){
                           
                            const addressesToDeleteForAccount = $('.item_delete_chekbox_for_id:checkbox:checked').closest('.row_adress_item').get();
                            const citiesToDeleteForAccount = $('.check_all:checkbox:checked').closest('.city_name').get();
                            let arrayOfAddressForAjax = [];
                            let arrayOfCitiesForAjax = [];
                            const accountId = parseInt($('select').find(":selected").data('id'));
                            if (!Number.isNaN(accountId)){
                                if (addressesToDeleteForAccount.length !== 0){
                                    $('.loader').toggleClass('d-block');
                                    arrayOfAddressForAjax = {};
                                    arrayOfAddressForAjax.id = 1;
                                    arrayOfAddressForAjax.addresses = [];
                                    for (const item of addressesToDeleteForAccount) {
                                        arrayOfAddressForAjax.addresses.push({"address": parseInt(item.attributes['data-id'].nodeValue)});
                                    }
                                    
                                    const dataArr = arrayOfAddressForAjax;
                                    $.ajax({
                                        type: "POST",
                                        url: HOST_ADDR + '/api/delete_address_for_all_accounts/',
                                        data: JSON.stringify(dataArr),
                                        contentType: "application/json; charset=utf-8", 
                                        success: function(data) {
                                           if(data.success == true ) {
                                                    storeScrollPosition();
                                                    location.reload();
                                                    $('.loader').toggleClass('d-block');

                                                }
                                            else if (data.success == false) {
                                                $('.loader').toggleClass('d-block');

                                                alert("Такой адрес уже существует");

                                            }
                                        },
                                        error: function(xhr, status, error) {
                                            console.log(xhr,status, error)
                                            $('.loader').toggleClass('d-block');

                                            alert("Такой адрес уже существует, ошибка");

                                        }
                                    });
                                }
                                if (citiesToDeleteForAccount.length !== 0) {
                                    $('.loader').toggleClass('d-block');
                                    arrayOfCitiesForAjax = [];
                                    for (const item of citiesToDeleteForAccount) {
                                        arrayOfCitiesForAjax.push({"city_name": item.children[1].value});
                                        delete dataToSend[`${item.children[1].value}`]
                                    }
                                    sessionStorage.setItem('URLParamsForPagination', JSON.stringify(dataToSend));
                                    const dataArr = arrayOfCitiesForAjax;
                                    $.ajax({
                                        type: "POST",
                                        url: HOST_ADDR + '/api/delete_city_for_all/',
                                        data: JSON.stringify(dataArr),
                                        contentType: "application/json; charset=utf-8", 
                                        success: function(data) {
                                           if(data.success == true ) {
                                                    storeScrollPosition();
                                                    location.reload();
                                                    $('.loader').toggleClass('d-block');

                                                }
                                            else if (data.success == false) {
                                                alert("Город не может быть удален");
                                                $('.loader').toggleClass('d-block');
                                            }
                                        },
                                        error: function(xhr, status, error) {
                                            console.log(xhr,status, error)
                                            alert("Город не может быть удален, ошибка");
                                            $('.loader').toggleClass('d-block');
                                        }
                                    });
                                }
                            }
                            else {
                                if (addressesToDeleteForAccount.length !== 0){
                                    $('.loader').toggleClass('d-block');
                                    arrayOfAddressForAjax = {};
                                    arrayOfAddressForAjax.id = 0;
                                    arrayOfAddressForAjax.addresses = [];
                                    for (const item of addressesToDeleteForAccount) {
                                        arrayOfAddressForAjax.addresses.push({"address": parseInt(item.attributes['data-id'].nodeValue)});
                                    }
                                    
                                    const dataArr = arrayOfAddressForAjax;
                                    $.ajax({
                                        type: "POST",
                                        url: HOST_ADDR + '/api/delete_address_for_all_accounts/',
                                        data: JSON.stringify(dataArr),
                                        contentType: "application/json; charset=utf-8", 
                                        success: function(data) {
                                           if(data.success == true ) {
                                                    storeScrollPosition();
                                                    location.reload();
                                                    $('.loader').toggleClass('d-block');

                                                }
                                            else if (data.success == false) {
                                                $('.loader').toggleClass('d-block');
    
                                                alert("Такой адрес уже существует");
    
                                            }
                                        },
                                        error: function(xhr, status, error) {
                                            console.log(xhr,status, error)
                                            $('.loader').toggleClass('d-block');
    
                                            alert("Такой адрес уже существует, ошибка");
    
                                        }
                                    });
                                }
                                if (citiesToDeleteForAccount.length !== 0) {
                                    $('.loader').toggleClass('d-block');
                                    arrayOfCitiesForAjax = [];
                                    for (const item of citiesToDeleteForAccount) {
                                        arrayOfCitiesForAjax.push({"city_name": item.children[1].value});
                                        delete dataToSend[`${item.children[1].value}`]
                                    }
                                    sessionStorage.setItem('URLParamsForPagination', JSON.stringify(dataToSend));
                                    const dataArr = arrayOfCitiesForAjax;
                                    $.ajax({
                                        type: "POST",
                                        url: HOST_ADDR + '/api/delete_city_for_all/',
                                        data: JSON.stringify(dataArr),
                                        contentType: "application/json; charset=utf-8", 
                                        success: function(data) {
                                            if(data.success == true) {
                                                storeScrollPosition();
                                                location.reload();
                                                $('.loader').toggleClass('d-block');
                                            }
                                            else if (data.success == false) {
                                                alert("Город не может быть удален");
                                                $('.loader').toggleClass('d-block');
                                            }
                                        },
                                        error: function(xhr, status, error) {
                                            console.log(xhr,status, error)
                                            alert("Город не может быть удален, ошибка");
                                            $('.loader').toggleClass('d-block');
                                        }
                                    });
                                }
                            }
                        });
                        $('.add_adresses').off('click').on('click', function(){
                            const thisCity = $(this).closest('.adress_city');
                            const thisCityName = thisCity.find('.city_input').val();
                            const accountName = $('select').find(":selected").text();
                            const accountId = parseInt($('select').find(":selected").data('id'));
                            Number.isNaN(accountId) ? $('.modal_add_adress .add_for_account').addClass('d-none') : '' ;
                            $('.modal_add_adress .title_city').text('Адреса для города: ' + thisCityName);
                            $('.modal_add_adress .title_account').text('Текущий аккаунт: ' + accountName);
                            $('.modal_add_adress').toggleClass('d-block');
                            $('.modal_add_adress .add_for_account').off('click').on('click', function(){
                                $('.loader').toggleClass('d-block');
                                const newAddressesCollectionLen = $('#adresses_push').val().trim().length;
                                if(newAddressesCollectionLen !== 0) {
                                    if (Number.isNaN(accountId)) {
                                        const newAddressesCollection = $('#adresses_push').val().trim();
                                        const arrayWithAddresses = newAddressesCollection.split('\n');
                                        const addressesObjects = arrayWithAddresses.map(address => {
                                            return {
                                                city: thisCityName,
                                                address: address.trim(),
                                                start: false,
                                                time_used: "0000-00-00"
                                            };
                                        });
                                        
                                        const dataArr = addressesObjects;
                                        $.ajax({
                                            type: "POST",
                                            url: HOST_ADDR + '/api/add_address_for_all_accounts/',
                                            data: JSON.stringify(dataArr),
                                            contentType: "application/json; charset=utf-8", 
                                            success: function(data) {
                                                if(data.success == true && data.existed_address.length == 0) {
                                                    storeScrollPosition();
                                                    location.reload();
                                                    $('.loader').toggleClass('d-block');

                                                }
                                                else if (data.success == true && data.existed_address.length !== 0) {
                                                    const existedAddresses = data.existed_address.join(',\n')
                                                    alert("Новые адреса были успешно добавлены, следующие дубли будут удалены: " + existedAddresses);
                                                    storeScrollPosition();
                                                    location.reload();
                                                    $('.loader').toggleClass('d-block');
        
                                                }
                                            },
                                            error: function(xhr, status, error) {
                                                console.log(xhr,status, error)
                                                $('.loader').toggleClass('d-block');
                                                alert("Такой адрес уже существует, ошибка");
                                            }});
                                    } else  if (!Number.isNaN(accountId)) {
                                        const newAddressesCollection = $('#adresses_push').val().trim();
                                        const arrayWithAddresses = newAddressesCollection.split('\n');
                                        const addressesObjects = arrayWithAddresses.map(address => {
                                            return {
                                                city: thisCityName,
                                                address: address.trim(),
                                                account_name: accountName,
                                                start: false,
                                                time_used: "0000-00-00"
                                            };
                                        });
                                        
                                        const dataArr = addressesObjects;
                                        $.ajax({
                                            type: "POST",
                                            url: HOST_ADDR + '/api/add_address_for_account/',
                                            data: JSON.stringify(dataArr),
                                            contentType: "application/json; charset=utf-8", 
                                            success: function(data) {
                                                if(data.success == true && data.existed_address.length == 0) {
                                                    storeScrollPosition();
                                                    location.reload();
                                                    $('.loader').toggleClass('d-block');

                                                }
                                                else if (data.success == true && data.existed_address.length !== 0) {
                                                    const existedAddresses = data.existed_address.join(',\n')
                                                    alert("Новые адреса были успешно добавлены, следующие дубли будут удалены: " + existedAddresses);
                                                    storeScrollPosition();
                                                    location.reload();
                                                    $('.loader').toggleClass('d-block');

        
                                                }
                                            },
                                            error: function(xhr, status, error) {
                                                console.log(xhr,status, error)
                                                $('.loader').toggleClass('d-block');
        
                                                alert("Такой адрес уже существует, ошибка");
        
                                            }});
                                    }
                                }
                                
                              
                            });
                            $('.modal_add_adress .add_for_all').off('click').on('click', function(){
                                $('.loader').toggleClass('d-block');
                                const newAddressesCollectionLen = $('#adresses_push').val().trim().length;
                                if(newAddressesCollectionLen !== 0) {
                                   
                                        const newAddressesCollection = $('#adresses_push').val().trim();
                                        const arrayWithAddresses = newAddressesCollection.split('\n');
                                        const addressesObjects = arrayWithAddresses.map(address => {
                                            return {
                                                city: thisCityName,
                                                address: address.trim()
                                            };
                                        });
                                        const dataArr = addressesObjects;
                                        $.ajax({
                                            type: "POST",
                                            url: HOST_ADDR + '/api/add_address_for_all_accounts/',
                                            data: JSON.stringify(dataArr),
                                            contentType: "application/json; charset=utf-8", 
                                            success: function(data) {
                                                if(data.success == true && data.existed_address.length == 0) {
                                                    storeScrollPosition();
                                                    location.reload();
                                                    $('.loader').toggleClass('d-block');

                                                }
                                                else if (data.success == true && data.existed_address.length !== 0) {
                                                    const existedAddresses = data.existed_address.join(',\n')
                                                    alert("Новые адреса были успешно добавлены, следующие дубли будут удалены: " + existedAddresses);
                                                    storeScrollPosition();
                                                    location.reload();
                                                    $('.loader').toggleClass('d-block');

                                                }
                                            },
                                            error: function(xhr, status, error) {
                                                console.log(xhr,status, error)
                                                $('.loader').toggleClass('d-block');
        
                                                alert("Такой адрес уже существует, ошибка");
        
                                            }});
                                }
                            });
                        })
                        $('.add_city').off('click').on('click', function(){
                            const thisCity = $(this).closest('.adress_city');
                            const thisCityName = thisCity.find('.city_input').val();
                            const accountName = $('select').find(":selected").text();
                            const accountId = parseInt($('select').find(":selected").data('id'));
                            Number.isNaN(accountId) ? $('.modal_add_city .add_for_account').addClass('d-none') : '' ;
                            $('.modal_add_city .title_account').text('Текущий аккаунт: ' + accountName);
                            $('.modal_add_city').toggleClass('d-block');
                            $('.modal_add_city .add_for_account').off('click').on('click', function(){
                                $('.loader').toggleClass('d-block');
                                const newACityLen = $('#city_push').val().trim().length;
                                if(newACityLen !== 0) {
                                    if (Number.isNaN(accountId)) {
                                        
                                        const newACity = $('#city_push').val().trim();
                                       
                                        const dataArr = {'city_name': newACity};
                                        $.ajax({
                                            type: "POST",
                                            url: HOST_ADDR + '/api/add_city_for_all/',
                                            data: JSON.stringify(dataArr),
                                            contentType: "application/json; charset=utf-8", 
                                            success: function(data) {
                                                if(data.success == true) {
                                                    storeScrollPosition();
                                                    dataToSend[`${newACity}`] = 1;
                                                    sessionStorage.setItem('URLParamsForPagination', JSON.stringify(dataToSend));
                                                    location.reload();
                                                }
                                                else if (data.success == false) {
                                                    $('.loader').toggleClass('d-block');
                                                    alert("Такой адрес уже существует");
                                                }
                                            },
                                            error: function(xhr, status, error) {
                                                console.log(xhr,status, error)
                                                $('.loader').toggleClass('d-block');
                                                alert("Такой адрес уже существует, ошибка");
                                            }});
                                    } else  if (!Number.isNaN(accountId)) {
                                        const newACity = $('#city_push').val().trim();
                                        const dataArr = {"city": newACity, "account_id": accountId};
                                        $.ajax({
                                            type: "POST",
                                            url: HOST_ADDR + '/api/add_city_for_account/',
                                            data: JSON.stringify(dataArr),
                                            contentType: "application/json; charset=utf-8", 
                                            success: function(data) {
                                                if(data.success == true) {
                                                    storeScrollPosition();
                                                    dataToSend[`${newACity}`] = 1;
                                                    sessionStorage.setItem('URLParamsForPagination', JSON.stringify(dataToSend));
                                                    location.reload();
                                                    

                                                }
                                                else if (data.success == false) {
                                                    $('.loader').toggleClass('d-block');
        
                                                    alert("Такой адрес уже существует");
        
                                                }
                                            },
                                            error: function(xhr, status, error) {
                                                console.log(xhr,status, error)
                                                $('.loader').toggleClass('d-block');
        
                                                alert("Такой адрес уже существует, ошибка");
        
                                            }});
                                    }
                                }
                                
                              
                            });
                            $('.modal_add_city .add_for_all').off('click').on('click', function(){
                                $('.loader').toggleClass('d-block');
                               
                                const newACityLen = $('#city_push').val().trim().length;
                                if(newACityLen !== 0) {
                                        const newACity = $('#city_push').val().trim();
                                        const dataArr = {"city_name": newACity};
                                        $.ajax({
                                            type: "POST",
                                            url: HOST_ADDR + '/api/add_city_for_all/',
                                            data: JSON.stringify(dataArr),
                                            contentType: "application/json; charset=utf-8", 
                                            success: function(data) {
                                                if(data.success == true) {
                                                    storeScrollPosition();
                                                    dataToSend[`${newACity}`] = 1;
                                                    sessionStorage.setItem('URLParamsForPagination', JSON.stringify(dataToSend));
                                                    location.reload();

                                                }
                                                else if (data.success == false) {
                                                    $('.loader').toggleClass('d-block');
                                                    alert("Такой адрес уже существует");
                                                }
                                            },
                                            error: function(xhr, status, error) {
                                                console.log(xhr,status, error)
                                                $('.loader').toggleClass('d-block');
                                                alert("Такой адрес уже существует, ошибка");
                                            }});
                                    }
                                })
                        })
                        $('.b-pageNum-n').off('click').on('click', function(){
                            $('.loader').toggleClass('d-block');
                            const thisCity = $(this).closest('.adress_city');
                            console.log(thisCity);
                            const thisCityName = thisCity.find('.city_input').val();
                            dataToSend[`${thisCityName}`] = $(this).data('page');
                            sessionStorage.setItem('URLParamsForPagination', JSON.stringify(dataToSend));
                            storeScrollPosition();
                            location.replace(`/adresses/?account_name=${getAccountURLValue()}`);
                         
                        })
                            $('.exit_edits').off('click').on('click', function(){
                                if (!$('.exit_edits').hasClass('d-none')) {
                                    storeScrollPosition();
                                    location.reload();
                                }
                            });
                        
                            $('[data-content="closeX"]').off('click').on('click', function(){
                                $(this).closest('.modal').toggleClass('d-block');
                            });
                            $('select').on('change', function() {
                                const selectedOption = $('select[name="accounts"] option').filter(':selected').val();
                                window.location.replace(BASE_HOST_APP + '/adresses/?account_name=' + selectedOption);
                            })
                            
                    });
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
   
}

gatherData(HOST_ADDR + '/api/get_accounts/', sessionTokenAddress);

   
if (getAccountURLValue() === 'all_accounts') {
    //gatherData(HOST_ADDR + '/api/get_all_addresses/', sessionTokenAddress)
    if (sessionStorage.length !== 0) {
        gatherData(HOST_ADDR + '/api/get_all_addresses/?data=' + sessionStorage.getItem('URLParamsForPagination'), sessionTokenAddress)
    } else {
        gatherData(HOST_ADDR + '/api/get_all_addresses/', sessionTokenAddress)
    }
} else {
   // gatherData(HOST_ADDR + `/api/get_address_for_account/?account_name=${getAccountURLValue()}`, sessionTokenAddress)
    if (sessionStorage.length !== 0) {
        gatherData(HOST_ADDR + `/api/get_address_for_account/?account_name=${getAccountURLValue()}&data=${sessionStorage.getItem('URLParamsForPagination')}`, sessionTokenAddress)
    } else {
        gatherData(HOST_ADDR + `/api/get_address_for_account/?account_name=${getAccountURLValue()}`, sessionTokenAddress)
    }
}