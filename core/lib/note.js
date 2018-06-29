require('../out/foo');

const marked = require('./marked');

const loader = cb => {
    self.wasm_bindgen('./main.wasm').then(() => cb(self.wasm_bindgen));
}

window.onload = function () {
    var eltitle = document.getElementsByClassName('title')[0];
    var elbody = document.getElementsByClassName('body')[0];

    const pass = location.hash.slice(1);

    if (pass === '') {
        eltitle.innerText = 'Error';
        elbody.innerText = 'No key given';

        return;
    }

    loader(foo => {
        const impis = foo.Impis.new(
            eltitle.innerText.trim(),
            elbody.innerText.trim()
        );
        
        // const pass = impis.init_generate_pass(require('crypto').randomBytes(100));
        impis.init_with_pass(pass);

        eltitle.innerText = impis.get_dec_title_str();
        elbody.innerHTML = marked(impis.get_dec_body_str());
        
        eltitle.style.display = 'block';
        elbody.style.display = 'block';
    });
};