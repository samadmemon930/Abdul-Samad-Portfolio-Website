let animatedSkills = new Set(); 

// Function to handle Skill Bar Animations (0% to value)
const handleSkillAnimation = () => {
    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;

    const sectionTop = skillsSection.getBoundingClientRect().top;
    const sectionBottom = skillsSection.getBoundingClientRect().bottom;
    const windowHeight = window.innerHeight;

    // Condition to check if section is visible in the viewport (Thoda pehle trigger karega)
    const isInView = sectionTop < windowHeight - 150 && sectionBottom > 0;
    
    // Condition to check if section is completely out of view (upar ya neeche)
    const isOutView = sectionTop > windowHeight || sectionBottom < 0;

    const skillItems = document.querySelectorAll('.skill-bar-item');

    if (isInView) {
        skillItems.forEach(item => {
            const progressValue = parseInt(item.getAttribute('data-progress'));
            const fillElement = item.querySelector('.progress-bar-fill');
            const percentageElement = item.querySelector('.skill-percentage');
            
            // Agar skill abhi tak animate nahi hui hai (ya reset ho chuki hai), to chalao
            if (!animatedSkills.has(item)) {
                animatedSkills.add(item); 
                
                // Reset to 0% for repeatable animation (transition ko 'none' kiya)
                fillElement.style.transition = 'none';
                fillElement.style.width = '0%';
                percentageElement.textContent = '0%';
                
                // Force repaint before adding transition (browser ko reset dikhane ke liye)
                void fillElement.offsetWidth; 

                // 1. Fill Animation (CSS Transition)
                fillElement.style.transition = 'width 2s ease-in-out';
                fillElement.style.width = `${progressValue}%`;

                // 2. Number Counter Animation (Fast 0 to percentage count)
                let current = 0;
                // Fast animation speed: 20ms interval
                const intervalTime = 20; 
                const totalDuration = 2000; // Match CSS transition duration (2s)
                const totalSteps = totalDuration / intervalTime;
                const step = Math.ceil(progressValue / totalSteps);
                
                const timer = setInterval(() => {
                    current += step;
                    if (current >= progressValue) {
                        current = progressValue;
                        clearInterval(timer);
                    }
                    percentageElement.textContent = `${current}%`;
                }, intervalTime);
            }
        });
    } else if (isOutView) {
        // Reset the set of animated items when the section leaves the view.
        // Isse agli baar scroll karne par animation dobara chalega.
        animatedSkills.clear(); 
    }
};


// Function to handle General Scroll-Based Animations (Repeatable)
const handleScrollAnimations = () => {
    const elementsToAnimate = document.querySelectorAll(
        '.fade-in-up, .fade-left, .fade-right, .service-box, .project-card'
    );
    const windowHeight = window.innerHeight;

    elementsToAnimate.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        const elementBottom = el.getBoundingClientRect().bottom;
        
        // Trigger condition: Jab element viewport mein ho (100px upar se)
        if (elementTop < windowHeight - 100 && elementBottom > 0) {
            el.classList.add('active-animate');
        } else if (elementTop > windowHeight || elementBottom < 0) {
            // Reset condition: Remove animation class jab element viewport se bahar nikal jaye
            // Taki agli baar scroll karne par dobara animate ho.
            el.classList.remove('active-animate'); 
        }
    });
};

// Function to handle Active Navigation Links (Same as before)
const handleActiveNavLinks = () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    let current = 'home'; // 'home' ki jagah 'hero' use kiya since ID is #hero

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100; 
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        // Check if the link's href ends with the current section ID
        if (link.href.endsWith(`#${current}`)) {
            link.classList.add('active');
        }
    });
};

// Main Event Listeners
window.addEventListener('scroll', () => {
    handleScrollAnimations();
    handleActiveNavLinks();
    handleSkillAnimation();
});

// Run functions once on load to catch elements already in view
document.addEventListener('DOMContentLoaded', () => {
    handleScrollAnimations();
    handleActiveNavLinks();
    handleSkillAnimation();
});

// Close mobile menu when a link is clicked
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.querySelectorAll('.nav-links a');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Check if the menu is open before closing
        if (menuToggle.checked) {
            menuToggle.checked = false;
        }
    });
});



  
// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCBvzWsTgNyYJ_-q5JnTQmbhx8zdyRJ8DE",
    authDomain: "portfolio-admin-dashboar-783b0.firebaseapp.com",
    databaseURL: "https://portfolio-admin-dashboar-783b0-default-rtdb.firebaseio.com/",
    projectId: "portfolio-admin-dashboar-783b0",
    storageBucket: "portfolio-admin-dashboar-783b0.appspot.com",
    messagingSenderId: "655897715980",
    appId: "1:655897715980:web:b8974002b4f31513ba5529"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref("about");

const aboutDescContainer = document.getElementById("aboutDescContainer");

// Fetch and display descriptions dynamically
db.child("descriptions").on("value", snapshot => {
    aboutDescContainer.innerHTML = "";
    const arr = snapshot.val() || [];
    arr.forEach(text => {
        const p = document.createElement("p");
        p.textContent = text;
        aboutDescContainer.appendChild(p);
    });
});


// ===== USER PANEL SKILLS =====
const userSkillsRef = firebase.database().ref("skills");
const userSkills = document.getElementById("userSkills");

userSkillsRef.on("value", snapshot => {
  userSkills.innerHTML = "";

  snapshot.forEach(child => {
    const skill = child.val();

    const skillDiv = document.createElement("div");
    skillDiv.className = "skill-bar-item fade-in-up";
    skillDiv.setAttribute("data-progress", skill.percent);

    skillDiv.innerHTML = `
      <div class="skill-info">
        <span class="skill-name">${skill.name}</span>
        <span class="skill-percentage">0%</span>
      </div>
      <div class="progress-bar-background">
        <div class="progress-bar-fill"></div>
      </div>
    `;

    userSkills.appendChild(skillDiv);
  });

  // animation dobara trigger
  animatedSkills.clear();
  handleSkillAnimation();
});


// ===== FIREBASE DATABASE =====
const database = firebase.database();
const projectsRef = database.ref("projects");

// ===== PROJECTS CONTAINER =====
const projectsContainer = document.getElementById("projectsContainer");

// ===== LOAD PROJECTS (DYNAMIC) =====
projectsRef.on("value", snapshot => {
    projectsContainer.innerHTML = "";

    if (!snapshot.exists()) {
        projectsContainer.innerHTML = "<p>No projects available</p>";
        return;
    }

    let delay = 0;

    snapshot.forEach(child => {
        const project = child.val();

        projectsContainer.innerHTML += `
            <div class="project-card fade-in-up delay-${delay}">
                <img src="${project.image}" alt="${project.name}">
                
                <div class="project-content">
                    <h1>${project.name}</h1>
                    <p>${project.desc}</p>

                    <div class="project-links">
                        <a href="${project.link}" target="_blank">
                            <i class="fas fa-external-link-alt"></i> View Project
                        </a>
                    </div>
                </div>
            </div>
        `;

        delay += 200; // animation delay
    });
});
