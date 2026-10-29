// Кликабельный макет системы возвратов: данные выдуманные, действия не сохраняются.
(function () {
    function toast(text) {
        var box = document.getElementById('maket-toast');
        if (!box) {
            box = document.createElement('div');
            box.id = 'maket-toast';
            box.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:100;max-width:90vw;' +
                'padding:10px 16px;border-radius:12px;background:#111827;color:#fff;font:600 14px Inter,sans-serif;' +
                'box-shadow:0 8px 24px rgba(0,0,0,.18);transition:opacity .2s;opacity:0;pointer-events:none';
            document.body.appendChild(box);
        }
        box.textContent = text;
        box.style.opacity = '1';
        clearTimeout(box._timer);
        box._timer = setTimeout(function () { box.style.opacity = '0'; }, 2200);
    }

    function openPhoto(src) {
        var layer = document.createElement('div');
        layer.style.cssText = 'position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;padding:16px;cursor:zoom-out';
        var img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.style.cssText = 'max-width:100%;max-height:90vh;border-radius:16px;background:#fff';
        layer.appendChild(img);
        layer.addEventListener('click', function () { layer.remove(); });
        document.addEventListener('keydown', function close(e) {
            if (e.key === 'Escape') { layer.remove(); document.removeEventListener('keydown', close); }
        });
        document.body.appendChild(layer);
    }

    var SAVE_NOTE = 'Это макет: в рабочей системе здесь сохраняется действие';

    document.addEventListener('click', function (e) {
        var photo = e.target.closest('[data-preview]');
        if (photo) { e.preventDefault(); openPhoto(photo.getAttribute('data-preview')); return; }
        var menu = e.target.closest('[data-maket-menu]');
        if (menu) {
            var side = document.getElementById('main-sidebar');
            if (side) side.classList.toggle('hidden');
            return;
        }
        var note = e.target.closest('[data-maket]');
        if (note) { e.preventDefault(); toast(note.getAttribute('data-maket')); return; }
        var row = e.target.closest('tr[data-href]');
        if (row && !e.target.closest('a,button')) { location.href = row.getAttribute('data-href'); return; }
        var button = e.target.closest('button');
        if (button && !(button.type === 'submit' && button.form)) { e.preventDefault(); toast(SAVE_NOTE); }
    });

    document.addEventListener('submit', function (e) {
        e.preventDefault();
        var form = e.target;
        if (form.id === 'login-form') { location.href = 'statistics.html'; return; }
        if (form.hasAttribute('data-maket-logout')) { location.href = 'index.html'; return; }
        toast(SAVE_NOTE);
    });

    document.addEventListener('change', function (e) {
        if (e.target.matches('input[type=file]')) { e.target.value = ''; toast('Это макет: файлы здесь не загружаются'); }
    });

    // Переключатель ролей и пометка, что данные выдуманные.
    var bar = document.createElement('div');
    bar.id = 'maket-bar';
    bar.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:80;display:flex;gap:4px;align-items:center;padding:4px;' +
        'border-radius:12px;background:#fff;box-shadow:0 4px 16px rgba(0,0,0,.14);font:600 12px Inter,sans-serif;color:#374151';
    bar.innerHTML = '<span style="padding:6px 8px">Макет, данные выдуманные</span>' +
        '<a href="statistics.html" style="padding:6px 10px;border-radius:8px;background:#111827;color:#fff;text-decoration:none">Сотрудник</a>' +
        '<a href="client-refunds.html" style="padding:6px 10px;border-radius:8px;background:#f3f4f6;color:#111827;text-decoration:none">Клиент</a>';
    document.body.appendChild(bar);
    var main = document.querySelector('main');
    if (main) main.style.paddingBottom = '64px';

    // На странице входа: войти можно и сотрудником, и клиентом.
    var login = document.getElementById('login-form');
    if (login) {
        var asClient = document.createElement('a');
        asClient.href = 'client-refunds.html';
        asClient.textContent = 'Войти как клиент';
        asClient.style.cssText = 'display:block;margin-top:10px;padding:10px;border-radius:12px;background:#f3f4f6;color:#111827;' +
            'text-align:center;font:600 14px Inter,sans-serif;text-decoration:none';
        login.appendChild(asClient);
        var email = login.querySelector('input[name=email]');
        var pass = login.querySelector('input[name=password]');
        if (email) { email.value = 'admin@demo.local'; email.removeAttribute('required'); }
        if (pass) { pass.value = 'demo'; pass.removeAttribute('required'); }
    }

    // Чат и комментарии открываются на последних сообщениях, как в системе.
    ['chat-messages', 'comments-list'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.scrollTop = el.scrollHeight;
    });
})();
