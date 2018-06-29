require('../out/foo');

const marked = require('./marked');

const loader = cb => {
    self.wasm_bindgen('/js/main.wasm').then(() => cb(self.wasm_bindgen));
}

window.onload = function () {
    var eltitle = document.getElementsByName('title')[0];
    var elbody = document.getElementsByName('body')[0];

    // preview
        var fpel = document.getElementsByName('body')[0];
        var fpelprev = document.getElementsByClassName('fprevpanel')[0];

        fpel.addEventListener('input', function () {
            fpelprev.innerHTML = marked(fpel.value);
        });

        fpel.addEventListener('keyup', function () {
            fpelprev.innerHTML = marked(fpel.value);
        });

        fpelprev.innerHTML = marked(fpel.value);

    loader(foo => {
        document.getElementById('publish-button').onclick = () => {
            const impis = foo.Impis.new(
                eltitle.value,
                elbody.value
            );
            
            const OTP = new Uint8Array(100); crypto.getRandomValues(OTP);
            const pass = impis.init_generate_pass(OTP);

            debugger;

            const enctitle = impis.get_enc_title();
            const encbody = impis.get_enc_body();

            const xhr = new window['XMLHttpRequest']();

            xhr['open']("POST", '/new-async', true);

            xhr['setRequestHeader']('Content-Type', 'application/json');

            xhr['onreadystatechange'] = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status !== 200) {
                        return void 0;
                    }

                    try {
                        const resp = JSON.parse(xhr.responseText);

                        window.location.replace(
                            `/n/${resp.hash}#${pass}`
                        );
                    } catch(err) {
                        console.log(err);
                    }
                }
            };

            xhr['onerror'] = () => {};

            xhr['send'](window['JSON']['stringify']({
                title: enctitle,
                body: encbody
            }));
        };
    });
};