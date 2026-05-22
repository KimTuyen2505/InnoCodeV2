</main>
<footer class="site-footer">
    <div class="container footer-grid">
        <div>
            <img class="footer-logo" src="<?= APP_URL ?>/assets/images/innocode.jpg" alt="<?= e(APP_NAME) ?>">
            <p>InnoCode cung cấp khóa học lập trình thực chiến, bài tập, quiz, compiler và học liệu đi kèm cho học viên tự học nghiêm túc.</p>
        </div>
        <div>
            <h3>InnoCode</h3>
            <a href="<?= url('about') ?>">Giới thiệu</a>
            <a href="<?= url('courses') ?>">Khóa học</a>
        </div>
        <div>
            <h3>Học tập</h3>
            <a href="<?= url('my_courses') ?>">Khóa học của tôi</a>
            <a href="<?= url('compiler') ?>">Trình biên dịch</a>
        </div>
        <div>
            <h3>Liên hệ</h3>
            <p>Email: InnoCode@gmail.com</p>
            <div class="footer-social">
                <span>Facebook</span>
                <span>YouTube</span>
                <span>GitHub</span>
            </div>
        </div>
    </div>
    <div class="container footer-bottom">InnoCode - Website khóa học lập trình thực chiến.</div>
</footer>
<div class="cart-toast" id="cart-toast" role="status" aria-live="polite">Đã thêm vào giỏ hàng.</div>
<script src="<?= APP_URL ?>/assets/js/app.js?v=ajax-20260522-3"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
