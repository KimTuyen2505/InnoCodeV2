(function () {
    if (window.innoCodeAjaxLoaded) {
        return;
    }
    window.innoCodeAjaxLoaded = true;
    document.documentElement.dataset.ajaxReady = '1';

    function isPostForm(form) {
        return form && form.tagName === 'FORM' && form.method.toLowerCase() === 'post';
    }

    function isSameWebsite(url) {
        var targetUrl = new URL(url, window.location.href);
        return targetUrl.origin === window.location.origin;
    }

    function getFormAction(form) {
        var action = form.getAttribute('action') || window.location.href;
        return new URL(action, window.location.href).href;
    }

    function showToast(message) {
        var toast = document.getElementById('cart-toast');
        if (!toast) {
            return;
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(function () {
            toast.classList.remove('show');
        }, 2200);
    }

    function setLoading(button, text) {
        if (!button) {
            return '';
        }
        var oldText = button.textContent;
        button.disabled = true;
        button.textContent = text;
        return oldText;
    }

    function restoreButton(button, oldText) {
        if (!button) {
            return;
        }
        button.disabled = false;
        button.textContent = oldText;
    }

    function addSubmitButton(formData, button) {
        if (button && button.name) {
            formData.set(button.name, button.value);
        }
    }

    function sendAjax(method, url, formData, callback) {
        var request = new XMLHttpRequest();
        request.open(method, url, true);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                callback(request);
            }
        };
        request.send(formData);
    }

    function reloadContent(html, url) {
        var parser = new DOMParser();
        var newPage = parser.parseFromString(html, 'text/html');

        if (!newPage.body) {
            window.location.href = url;
            return;
        }

        document.title = newPage.title || document.title;
        document.body.innerHTML = newPage.body.innerHTML;
        runPageScripts();

        if (url && isSameWebsite(url)) {
            history.pushState(null, '', url);
        }

        initPage();
        window.scrollTo(0, 0);
    }

    function loadPage(url) {
        sendAjax('GET', url, null, function (request) {
            if (request.status >= 200 && request.status < 400) {
                reloadContent(request.responseText, request.responseURL || url);
                return;
            }
            window.location.href = url;
        });
    }

    function runPageScripts() {
        document.querySelectorAll('script').forEach(function (oldScript) {
            var src = oldScript.getAttribute('src') || '';

            if (src.indexOf('/assets/js/app.js') !== -1) {
                return;
            }

            var script = document.createElement('script');

            if (src) {
                script.src = src;
            } else {
                script.text = oldScript.textContent;
            }

            oldScript.parentNode.replaceChild(script, oldScript);
        });
    }

    function handleResponse(request, fallbackUrl) {
        var contentType = request.getResponseHeader('Content-Type') || '';

        if (contentType.indexOf('application/json') !== -1) {
            var data = {};
            try {
                data = JSON.parse(request.responseText || '{}');
            } catch (error) {
                window.location.href = fallbackUrl;
                return;
            }
            if (data.redirect) {
                loadPage(data.redirect);
                return;
            }
            if (data.cart_count !== undefined) {
                var cartCount = document.getElementById('cart-count');
                if (cartCount) {
                    cartCount.textContent = data.cart_count;
                }
            }
            if (data.message) {
                showToast(data.message);
            }
            return;
        }

        if (request.status >= 200 && request.status < 400) {
            reloadContent(request.responseText, request.responseURL || fallbackUrl);
            return;
        }

        window.location.href = fallbackUrl;
    }

    function submitFormByAjax(form, submitButton) {
        var action = getFormAction(form);
        var button = submitButton && submitButton.tagName === 'BUTTON'
            ? submitButton
            : form.querySelector('button[type="submit"]');
        var oldText = setLoading(button, 'Đang xử lý...');
        var formData = new FormData(form);
        addSubmitButton(formData, submitButton);

        sendAjax('POST', action, formData, function (request) {
            restoreButton(button, oldText);
            handleResponse(request, action);
        });
    }

    function saveLessonNote(form, submitButton) {
        var button = submitButton || form.querySelector('button[type="submit"]');
        var oldText = setLoading(button, 'Đang lưu...');
        var status = form.querySelector('.note-save-status');

        if (!status) {
            status = document.createElement('span');
            status.className = 'note-save-status';
            var row = form.querySelector('.lesson-action-row');
            if (row) {
                row.appendChild(status);
            }
        }

        var formData = new FormData(form);
        formData.set('ajax', '1');
        addSubmitButton(formData, submitButton);

        sendAjax('POST', getFormAction(form), formData, function (request) {
            restoreButton(button, oldText);

            try {
                var data = JSON.parse(request.responseText || '{}');
                if (request.status < 200 || request.status >= 400 || !data.ok) {
                    throw new Error(data.message || 'Không lưu được ghi chú.');
                }
                status.textContent = data.message || 'Đã lưu ghi chú.';
                status.classList.remove('text-danger');
                status.classList.add('text-success');
            } catch (error) {
                status.textContent = 'Không lưu được ghi chú.';
                status.classList.remove('text-success');
                status.classList.add('text-danger');
            }
        });
    }

    function saveNoteThenDownload(form, url) {
        var formData = new FormData(form);
        formData.set('ajax', '1');

        sendAjax('POST', getFormAction(form), formData, function (request) {
            try {
                var data = JSON.parse(request.responseText || '{}');
                if (request.status >= 200 && request.status < 400 && data.ok) {
                    window.location.href = url;
                    return;
                }
            } catch (error) {
            }
            form.submit();
        });
    }

    function changeTheme() {
        var nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = nextTheme;
        localStorage.setItem('theme', nextTheme);
        syncThemeButtons();
    }

    function syncThemeButtons() {
        document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
            button.textContent = document.documentElement.dataset.theme === 'dark' ? '☀' : '☾';
        });
    }

    function initAdminMenu() {
        document.querySelectorAll('[data-admin-nav-group]').forEach(function (group) {
            var key = 'admin-nav-group-' + group.dataset.adminNavGroup;
            var saved = localStorage.getItem(key);

            if (saved === 'open') {
                group.open = true;
            }
            if (saved === 'closed') {
                group.open = false;
            }
            if (group.querySelector('a.active') && saved === null) {
                group.open = true;
            }
        });
    }

    function syncCompiler(select) {
        var samples = window.compilerSamples || window.lessonCompilerSamples || {};
        var card = select.closest('.compiler-card') || document;
        var editor = card.querySelector('.js-lesson-compiler-code') || document.getElementById('compiler-code');
        var stdin = card.querySelector('textarea[name="stdin"]');

        if (editor) {
            editor.value = samples[select.value] || '';
        }
        if (stdin) {
            stdin.value = '';
        }

        var head = document.getElementById('compiler-result-head');
        if (head) {
            head.textContent = 'Output';
        }

        var frame = card.querySelector('iframe');
        if (frame) {
            frame.remove();
        }

        var output = card.querySelector('.js-lesson-compiler-output') || document.getElementById('compiler-output');
        if (output) {
            output.textContent = 'Kết quả chạy code sẽ hiển thị tại đây.';
        }
    }

    function syncQuestionForm(form) {
        var typeSelect = form.querySelector('[data-question-type]');
        if (!typeSelect) {
            return;
        }

        var isEssay = typeSelect.value === 'essay';
        var choiceFields = form.querySelectorAll('[data-choice-field], [data-choice-answer]');
        var essayFields = form.querySelectorAll('[data-essay-field], [data-essay-hint]');

        choiceFields.forEach(function (field) {
            field.classList.toggle('d-none', isEssay);
            field.querySelectorAll('input, select, textarea').forEach(function (control) {
                control.disabled = isEssay;
            });
        });

        essayFields.forEach(function (field) {
            field.classList.toggle('d-none', !isEssay);
            field.querySelectorAll('input, select, textarea').forEach(function (control) {
                control.disabled = !isEssay;
            });
        });
    }

    function initPage() {
        syncThemeButtons();
        initAdminMenu();
        document.querySelectorAll('[data-quiz-question-form]').forEach(syncQuestionForm);
    }

    document.addEventListener('click', function (event) {
        var themeButton = event.target.closest('[data-theme-toggle]');
        if (themeButton) {
            changeTheme();
            return;
        }

        var downloadLink = event.target.closest('[data-note-download]');
        if (!downloadLink) {
            return;
        }

        var noteForm = downloadLink.closest('.js-note-form');
        if (!noteForm) {
            return;
        }

        event.preventDefault();
        saveNoteThenDownload(noteForm, downloadLink.href);
    });

    document.addEventListener('submit', function (event) {
        var form = event.target;
        if (!isPostForm(form)) {
            return;
        }

        if (form.dataset.noAjax === '1' || !isSameWebsite(getFormAction(form))) {
            return;
        }

        event.preventDefault();

        if (form.classList.contains('js-note-form')) {
            saveLessonNote(form, event.submitter || null);
            return;
        }

        submitFormByAjax(form, event.submitter || null);
    });

    document.addEventListener('change', function (event) {
        var compilerSelect = event.target.closest('#compiler-language, .js-lesson-compiler-language');
        if (compilerSelect) {
            syncCompiler(compilerSelect);
            return;
        }

        var typeSelect = event.target.closest('[data-question-type]');
        if (typeSelect) {
            var form = typeSelect.closest('[data-quiz-question-form]');
            if (form) {
                syncQuestionForm(form);
            }
        }
    });

    document.addEventListener('toggle', function (event) {
        var group = event.target.closest('[data-admin-nav-group]');
        if (group) {
            localStorage.setItem('admin-nav-group-' + group.dataset.adminNavGroup, group.open ? 'open' : 'closed');
        }
    }, true);

    window.addEventListener('popstate', function () {
        loadPage(window.location.href);
    });

    document.addEventListener('DOMContentLoaded', initPage);
    initPage();
})();
