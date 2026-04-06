document.addEventListener('DOMContentLoaded', () => {

    // ═══════════════════════════════════════════
    // 1. NAVBAR SHRINK ON SCROLL
    // ═══════════════════════════════════════════
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });


    // ═══════════════════════════════════════════
    // 2. SCROLL ANIMATIONS (fade-up)
    // ═══════════════════════════════════════════
    const fadeObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), i * 100);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));


    // ═══════════════════════════════════════════
    // 3. SCROLL SPY — active nav link per section
    // ═══════════════════════════════════════════
    const navItems = document.querySelectorAll('.nav-item[data-target]');

    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navItems.forEach(link => {
                    link.classList.toggle('active', link.dataset.target === entry.target.id);
                });
            }
        });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

    document.querySelectorAll('section[id]').forEach(s => spyObserver.observe(s));

    // Smooth scroll on nav link click
    navItems.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.dataset.target;
            if (!targetId) return;
            e.preventDefault();
            const section = document.getElementById(targetId);
            if (section) window.scrollTo({ top: section.offsetTop - 80, behavior: 'smooth' });
        });
    });

    // Logo → scroll to top
    const logoLink = document.getElementById('logoLink');
    if (logoLink) {
        logoLink.addEventListener('click', e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // ═══════════════════════════════════════════
    // 4. TYPEWRITER EFFECT
    // ═══════════════════════════════════════════
    const typewriterInput = document.getElementById('typewriter');
    const prompts = [
        "Why is my code giving segmentation fault?",
        "What is the time complexity of bubble sort?",
        "Explain this recursive function line by line",
        "How do I fix this Java NullPointerException?"
    ];
    let pIdx = 0, cIdx = 0, deleting = false;

    function typeWriter() {
        const current = prompts[pIdx];
        typewriterInput.placeholder = current.substring(0, deleting ? cIdx - 1 : cIdx + 1);
        deleting ? cIdx-- : cIdx++;

        let delay = deleting ? 30 : 60;
        if (!deleting && cIdx === current.length) { delay = 2000; deleting = true; }
        else if (deleting && cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % prompts.length; delay = 500; }

        setTimeout(typeWriter, delay);
    }
    if (typewriterInput) setTimeout(typeWriter, 1000);

    // Suggestion chips
    document.querySelectorAll('.suggest-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            typewriterInput.value = chip.innerText;
            typewriterInput.placeholder = '';
        });
    });


    // ═══════════════════════════════════════════
    // 5. BOOKING MODAL (3-step)
    // ═══════════════════════════════════════════
    const bookingModal = document.getElementById('bookingModal');
    const bookingSteps = [document.getElementById('step1'), document.getElementById('step2'), document.getElementById('step3')];
    const bookingInds = [document.getElementById('ind1'), document.getElementById('ind2'), document.getElementById('ind3')];
    const nextBtn = document.getElementById('modalNext');
    const backBtn = document.getElementById('modalBack');
    const modalClose = document.getElementById('modalClose');
    let bookingStep = 0;

    function openBooking() {
        bookingModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeBooking() {
        bookingModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        setTimeout(() => { bookingStep = 0; updateBookingSteps(); }, 400);
    }

    function updateBookingSteps() {
        bookingSteps.forEach((s, i) => s && s.classList.toggle('active', i === bookingStep));
        bookingInds.forEach((ind, i) => {
            if (!ind) return;
            ind.classList.remove('active', 'completed');
            if (i === bookingStep) ind.classList.add('active');
            else if (i < bookingStep) ind.classList.add('completed');
        });
        if (backBtn) backBtn.style.visibility = bookingStep === 0 ? 'hidden' : 'visible';
        if (nextBtn) nextBtn.innerText = bookingStep === 2 ? 'Confirm Booking' : 'Next Step';
    }

    document.getElementById('navBookDemo')?.addEventListener('click', e => { e.preventDefault(); openBooking(); });
    document.getElementById('btnBookDemo')?.addEventListener('click', e => { e.preventDefault(); openBooking(); });
    modalClose?.addEventListener('click', closeBooking);
    bookingModal?.addEventListener('click', e => { if (e.target === bookingModal) closeBooking(); });

    nextBtn?.addEventListener('click', () => {
        if (bookingStep < 2) { bookingStep++; updateBookingSteps(); }
        else {
            nextBtn.innerText = 'Submitting...';
            setTimeout(() => { alert('Demo booked successfully!'); closeBooking(); nextBtn.innerText = 'Confirm Booking'; }, 1000);
        }
    });
    backBtn?.addEventListener('click', () => { if (bookingStep > 0) { bookingStep--; updateBookingSteps(); } });

    // Calendar
    const calendar = document.getElementById('calendar');
    if (calendar) {
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => {
            const el = document.createElement('div');
            el.innerText = d;
            el.style.cssText = 'color:#6b7280;font-size:0.8rem;text-align:center';
            calendar.appendChild(el);
        });
        for (let i = 1; i <= 14; i++) {
            const btn = document.createElement('div');
            btn.className = 'cal-day' + (i < 3 ? ' cal-disabled' : '');
            btn.innerText = i + 10;
            btn.addEventListener('click', function () {
                if (this.classList.contains('cal-disabled')) return;
                document.querySelectorAll('.cal-day').forEach(el => el.classList.remove('selected'));
                this.classList.add('selected');
            });
            calendar.appendChild(btn);
        }
        document.querySelector('.cal-day:not(.cal-disabled)')?.classList.add('selected');
    }

    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.time-btn').forEach(el => el.classList.remove('selected'));
            this.classList.add('selected');
        });
    });


    // ═══════════════════════════════════════════
    // 6. AUTH MODALS — Login & Signup
    // ═══════════════════════════════════════════
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');

    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        if (!document.querySelector('.modal-overlay.active')) {
            document.body.style.overflow = 'auto';
        }
    }

    document.getElementById('navLoginBtn')?.addEventListener('click', () => openModal(loginModal));
    document.getElementById('navSignUpBtn')?.addEventListener('click', () => openModal(signupModal));
    document.getElementById('loginClose')?.addEventListener('click', () => closeModal(loginModal));
    document.getElementById('signupClose')?.addEventListener('click', () => closeModal(signupModal));

    window.addEventListener('click', e => {
        if (e.target === loginModal) closeModal(loginModal);
        if (e.target === signupModal) closeModal(signupModal);
    });

    // Switch between login ↔ signup
    document.getElementById('linkToSignUp')?.addEventListener('click', e => {
        e.preventDefault();
        closeModal(loginModal);
        setTimeout(() => openModal(signupModal), 300);
    });

    document.getElementById('linkToLogin')?.addEventListener('click', e => {
        e.preventDefault();
        closeModal(signupModal);
        setTimeout(() => openModal(loginModal), 300);
    });


    // ═══════════════════════════════════════════
    // 7. SIGNUP — 2-step flow
    // ═══════════════════════════════════════════
    const suStep1 = document.getElementById('suStep1');
    const suStep2 = document.getElementById('suStep2');
    const suNextBtn = document.getElementById('suNextBtn');
    const suStepNum = document.getElementById('suStepNum');
    const suFooter = document.getElementById('suFooter');

    suNextBtn?.addEventListener('click', e => {
        e.preventDefault();
        suStep1?.classList.remove('active');
        suStep2?.classList.add('active');
        if (suStepNum) suStepNum.innerText = '2';
        if (suFooter) suFooter.style.display = 'none';
    });

    // Use-case card multi-select
    document.querySelectorAll('.use-case-card').forEach(card => {
        card.addEventListener('click', () => card.classList.toggle('selected'));
    });

    // Password strength meter
    const suPassword = document.getElementById('suPassword');
    const strengthBar = document.getElementById('strengthBar');

    suPassword?.addEventListener('input', e => {
        const v = e.target.value;
        let strength = 0;
        if (v.length > 5) strength += 33;
        if (v.length > 8 && /[A-Z]/.test(v)) strength += 33;
        if (v.length > 10 && /[0-9!@#%^&*]/.test(v)) strength += 34;
        if (strengthBar) {
            strengthBar.style.width = strength + '%';
            strengthBar.style.background = strength <= 33 ? '#ff5c5c' : strength <= 66 ? '#f1e05a' : '#00e5a0';
        }
    });


    // ═══════════════════════════════════════════
    // 8. AUTH STATE — avatar & localStorage
    // ═══════════════════════════════════════════
    const navAuthArea = document.getElementById('navAuthArea');

    function buildAvatar() {
        if (!navAuthArea) return;
        navAuthArea.innerHTML = `
      <div class="user-avatar-btn" id="userAvatar">
        CR
        <div class="avatar-dropdown" id="avatarDropdown">
          <div class="dropdown-item">Profile</div>
          <div class="dropdown-item">My Saved Code</div>
          <div class="dropdown-item">Settings</div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item danger">Log Out</div>
        </div>
      </div>`;

        const avatar = document.getElementById('userAvatar');
        const dropdown = document.getElementById('avatarDropdown');

        avatar?.addEventListener('click', e => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        window.addEventListener('click', () => dropdown?.classList.remove('active'));

        dropdown?.querySelector('.danger')?.addEventListener('click', () => {
            localStorage.removeItem('nexus_logged_in');
            location.reload();
        });
    }

    function loginSuccess(e) {
        e?.preventDefault();
        localStorage.setItem('nexus_logged_in', 'true');
        closeModal(loginModal);
        closeModal(signupModal);
        buildAvatar();
    }

    // Restore login state on page load
    if (localStorage.getItem('nexus_logged_in') === 'true') buildAvatar();

    // Bind login & finish buttons
    document.getElementById('doLoginBtn')?.addEventListener('click', loginSuccess);
    document.getElementById('suFinishBtn')?.addEventListener('click', loginSuccess);


    // ═══════════════════════════════════════════
    // 9. COMPILER PANEL — corner IDE panel
    // ═══════════════════════════════════════════
    const compilerPanel = document.getElementById('compilerPanel');
    const navCompilerBtn = document.getElementById('navCompilerBtn');
    const panelMaximize = document.getElementById('panelMaximize');
    const panelMinimize = document.getElementById('panelMinimize');
    const panelClose = document.getElementById('panelClose');

    let isMaximized = false;
    let isMinimized = false;

    // Open panel
    navCompilerBtn?.addEventListener('click', e => {
        e.preventDefault();
        if (!compilerPanel) return;
        compilerPanel.classList.add('open');
        compilerPanel.classList.remove('minimized', 'maximized');
        navCompilerBtn.classList.add('active');
        isMaximized = false;
        isMinimized = false;
        if (panelMaximize) panelMaximize.innerHTML = '⤢';
    });

    // Close panel
    panelClose?.addEventListener('click', () => {
        compilerPanel.classList.remove('open', 'minimized', 'maximized');
        navCompilerBtn?.classList.remove('active');
        isMaximized = false;
        isMinimized = false;
    });

    // Maximize ↔ Restore
    panelMaximize?.addEventListener('click', () => {
        if (!isMaximized) {
            compilerPanel.classList.add('maximized');
            compilerPanel.classList.remove('minimized');
            panelMaximize.innerHTML = '&#8601;'; // shrink icon
            panelMaximize.title = 'Restore';
            isMaximized = true;
            isMinimized = false;
        } else {
            compilerPanel.classList.remove('maximized');
            panelMaximize.innerHTML = '⤢';
            panelMaximize.title = 'Expand';
            isMaximized = false;
        }
    });

    // Minimize → floating chip
    panelMinimize?.addEventListener('click', e => {
        e.stopPropagation();
        compilerPanel.classList.add('minimized');
        compilerPanel.classList.remove('maximized');
        isMinimized = true;
        isMaximized = false;
        if (panelMaximize) panelMaximize.innerHTML = '⤢';
    });

    // Click minimized chip → restore
    compilerPanel?.addEventListener('click', e => {
        if (isMinimized && !e.target.closest('.panel-controls')) {
            compilerPanel.classList.remove('minimized');
            isMinimized = false;
        }
    });

    // Auto-fullscreen on small screens when opened
    function checkPanelResponsive() {
        if (compilerPanel?.classList.contains('open') && window.innerWidth < 768) {
            compilerPanel.classList.add('maximized');
            isMaximized = true;
        }
    }
    window.addEventListener('resize', checkPanelResponsive);

});