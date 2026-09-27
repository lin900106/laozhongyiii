// -*- coding: utf-8 -*-
// 老中医化妆品 · 全局交互脚本

document.addEventListener('DOMContentLoaded', function () {

  // 0. 自动注入四角鎏金云头线描（首页 .hero + 内页 .page-hero，全站统一）
  document.querySelectorAll('.hero, .page-hero').forEach(function (host) {
    if (host.querySelector('.corner')) return;
    ['tl', 'tr', 'bl', 'br'].forEach(function (pos) {
      var s = document.createElement('span');
      s.className = 'corner corner--' + pos + ' corner--cloud';
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML = '<img class="corner-ruyi" src="images/ruyi.svg" alt="">';
      host.appendChild(s);
    });
  });

  // 1. 移动端汉堡菜单
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    // 点击链接后收起菜单
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
      });
    });
  }

  // 2. 滚动淡入动画（同组卡片依次浮现，最多错 4 档）
  var reveals = document.querySelectorAll(
    '.concern-card, .product-card, .news-item, .story-banner, .manifesto, .section-head, .formula-card'
  );
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el, i) {
      el.classList.add('reveal');
      // 同一容器内的兄弟卡片做 90ms 阶梯延迟

      var sameKind = el.parentNode ? el.parentNode.querySelectorAll(':scope > ' + el.classList[0]) : null;
      if (sameKind && sameKind.length > 1) {
        var idx = Array.prototype.indexOf.call(sameKind, el);
        if (idx > 0) el.style.setProperty('--rd', Math.min(idx, 4) * 0.09 + 's');
      }
      observer.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in-view'); });
  }

  // 2b. 导航滚动后加深底色（rAF 节流，越过 10px 才切换）
  var header = document.querySelector('.site-header');
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        header.classList.toggle('header--scrolled', window.scrollY > 10);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 3. 联系页 · 免费肌肤诊断表单校验（纯静态，无后端）
  var form = document.getElementById('skinForm');
  if (form) {
    var success = document.getElementById('formSuccess');

    // 必填项规则：id -> 校验函数/错误文案
    var rules = {
      'f-name': function (v) {
        return v.trim() ? '' : '请填写您的称呼';
      },
      'f-phone': function (v) {
        var n = v.replace(/[\s-]/g, '');
        if (!n) return '请填写联系手机';
        return /^1[3-9]\d{9}$/.test(n) ? '' : '手机号格式不正确，请输入 11 位手机号';
      },
      'f-concern': function (v) {
        return v ? '' : '请选择主要肌肤困扰';
      }
    };

    // 输入时清除该项错误
    Object.keys(rules).forEach(function (id) {
      var input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', function () {
          input.closest('.field').classList.remove('has-error');
        });
        input.addEventListener('change', function () {
          input.closest('.field').classList.remove('has-error');
        });
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;

      Object.keys(rules).forEach(function (id) {
        var input = document.getElementById(id);
        var field = input.closest('.field');
        var msg = rules[id](input.value);
        var errEl = field.querySelector('.field-error');
        if (msg) {
          field.classList.add('has-error');
          if (errEl) errEl.textContent = msg;
          if (!firstBad) firstBad = input;
        } else {
          field.classList.remove('has-error');
        }
      });

      if (firstBad) {
        firstBad.focus();
        return;
      }

      // 纯静态站：只做前端成功提示，不真正提交
      if (success) {
        success.hidden = false;
        success.classList.add('show');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      form.reset();
    });
  }

});
