window.addEventListener('load', async() => {

    const search_btn = document.getElementById('search_btn');
    const search_text = document.getElementById('search_text');
    const search_text_close = document.getElementById('search_text_close');


    const client_info = document.getElementById('client_info').content;
    const resultados = document.getElementById('resultados');


    search_text.focus();
    const processedUrl = (args = {}) => {
        let params = '';
        if (args.page && args.search) {
            params = `?only_search=1&search=${args.search}&page=${args.page}`;
        } else if (args.page) {
            params = `?page=${args.page}`;
        } else if (args.search) {
            params = `?only_search=1&search=${args.search}`;
        }

        return `https://dev.orkestra.mx/api/v1/directory/customers${params}`;
    }

    const getClients = async(params = { page: null }) => {

        const div = document.createElement('div');
        div.classList = ['flex justify-content-center'];
        const img = document.createElement('img');
        img.src = '/img/spinner.gif';
        img.classList = ['icon-spinner'];
        div.appendChild(img);
        resultados.appendChild(div);

        try {
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImI1MDc1MDU3YTBiODY0NDY2YjQ3NjYxNjQ4OTA4ODIwYTYxNjcwZmU3MDIzOGU3ZjY4NDIyNWM2YzgwZjdkNWVjNzcxYTVlZGEwYjlmNzgzIn0.eyJhdWQiOiI1IiwianRpIjoiYjUwNzUwNTdhMGI4NjQ0NjZiNDc2NjE2NDg5MDg4MjBhNjE2NzBmZTcwMjM4ZTdmNjg0MjI1YzZjODBmN2Q1ZWM3NzFhNWVkYTBiOWY3ODMiLCJpYXQiOjE2NDYxNjY3NDMsIm5iZiI6MTY0NjE2Njc0MywiZXhwIjo0ODAxODQwMzQzLCJzdWIiOiIxIiwic2NvcGVzIjpbImNvbXBhbnlfdG9rZW4iXX0.OrdDYHzXdWqs9lGrP8_Wze07mNmhEnILvDuTfQrkLX5k3uMYfxHCBaUuZD5XXn7xBm2yJfaOwKLDo5sIf6J3FCQzzgjAFcr_wDrVt8zWdyQqq8DToqzdU06OB_htE0qJ-TyQEhED9ORRBDoROKMFIeKz_psBwQPjyH8AS34jrELrwW-6X9DioMqTk3Go976EMSL9PvyCBY1VkjVvkexc3eFfoHMiZXHVfmG89fr7ZhAEH81j9mH8Nd_tk3lSBrIBjda5JLm0ec-qWKjn7KNOOoQSbhWL3kyMG9eUT43JGMA-8Qy-OgBn0p2h4i2VuppJ8CD-O9IxaBOYOM9C7o6LuRwlGibb94UIAvbbTGC_i2x_DSfj8TkXstqSvKoZiSQo87M6FBNqngI8nuBxHCFNuPUzJJhRuj4D3YVmZsfzDaJLoV3SgP7ICK8YdUxRyAHpzsCtfbxgpwEFKQDY5LWdJwAvWN-sM3utz92fdHwZVqXLEDC37Be8eVbnNF29Lua4O3N8eBGix8XJ3GpZERy9kDJPQBbG32OOCAT0_c7u6KJaOdjoJ8Gnb6fws2CvBYW8arDgubwcHqu_SOpElupSU4aYhwp60-TiiEdarb82006r9XMHUSiNKAi02rq2wifbqhA-q995G3Y1O-tyKqSNqYRDILFcVjYfKwqzSQBsobE'
                }
            }
            const url = processedUrl(params);
            const request = await (await fetch(url, config)).json();

            if (request.status === 'success') {
                return request.customers;
            }

            return [];

        } catch (error) {
            console.log(error)
        }
    }


    search_text_close.addEventListener('click', async function(evt) {
        search_text.value = '';
        this.classList.add('hide');
        resetResultsMessage();
        search_text.focus();
    });
    search_text.addEventListener('keyup', async function(evt) {
        if (this.value.length > 2) {
            search_btn.disabled = false;
            search_btn.classList.add('active');
            search_text_close.classList.remove('hide');
        } else {
            search_btn.disabled = true;
            search_text_close.classList.add('hide');
            search_btn.classList.remove('active');
        }
    });


    search_form.addEventListener('submit', async function(evt) {
        evt.preventDefault();

        const clients = await getClients({ search: search_text.value });
        const pagination_el = document.getElementById('pagination1');
        const pagination_el2 = document.getElementById('pagination2');
        if (clients.total > 10) {
            render(clients);
            pagination_el.classList.remove('hide');
            pagination_el2.classList.remove('hide');
            const pagination = new tui.Pagination('pagination1', {
                totalItems: clients.total,
                itemsPerPage: clients.per_page,
                visiblePages: 3,
                centerAlign: true
            });
            pagination.on('afterMove', async function({ page }) {
                if (pagination2.getCurrentPage() !== page) {
                    pagination2.movePageTo(page);
                    const clients = await getClients({ search: search_text.value, page });
                    render(clients);
                }

            });

            const pagination2 = new tui.Pagination('pagination2', {
                totalItems: clients.total,
                itemsPerPage: clients.per_page,
                visiblePages: 3,
                centerAlign: true
            });

            pagination2.on('afterMove', async function({ page }) {
                if (pagination.getCurrentPage() !== page) {
                    pagination.movePageTo(page);
                    const clients = await getClients({ search: search_text.value, page });
                    render(clients);
                }
            });
        } else {
            pagination_el.classList.add('hide');
            pagination_el2.classList.add('hide');
            render(clients);
        }

    });




    function resetResultsMessage() {
        const message = document.getElementById('results_search_message');
        message.textContent = '';
    }

    function render({ data: clients, total } = []) {
        resultados.textContent = '';
        const fragment = document.createDocumentFragment();
        const message = document.getElementById('results_search_message');

        message.textContent = '';

        const h3 = document.createElement('h3');
        h3.textContent = 'Resultado de la busqueda';
        if (!total) {
            h3.textContent = 'Sin resultados';
        } else {
            clients.forEach(item => {

                client_info.querySelector('.client-name').textContent = item.name.toUpperCase();

                if (item.email) {
                    client_info.querySelector('.client-email').textContent = item.email;
                }



                if (!item.cellphone) {
                    client_info.querySelector('p.client-info__cellphone').textContent = 'N/D';
                } else {
                    client_info.querySelector('p.client-info__cellphone').textContent = item.cellphone;
                    if (!item.verified_cellphone) {
                        client_info.querySelector('img.cellphone-icon').src = '/img/failure.png';
                    } else {
                        client_info.querySelector('img.cellphone-icon').src = '/img/success.png';
                    }
                }

                client_info.querySelector('p.client-info__ticket').textContent = item.highest_ticket_amount_format;
                client_info.querySelector('p.client-info__period').textContent = item.period_without_purchase_human_format;

                if (item.last_contact) {
                    client_info.querySelector('p.client-info__last-contact').textContent = item.last_contact.last_contact_human_format;

                    const limit_date = moment().subtract(60, 'days');
                    const last_contact_date = moment(item.last_contact.created_at);

                    if (last_contact_date.isBefore(limit_date)) {
                        client_info.querySelector('img.last-contact-icon').src = '/img/warning.png';
                    } else {
                        client_info.querySelector('img.last-contact-icon').src = '';
                    }
                } else {
                    client_info.querySelector('img.last-contact-icon').src = '';
                    client_info.querySelector('p.client-info__last-contact').textContent = 'N/D';
                }
                const clone = client_info.cloneNode(true);
                fragment.appendChild(clone);
            });
            resultados.appendChild(fragment);
        }

        message.appendChild(h3);


    }

});