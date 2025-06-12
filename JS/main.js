
    const { jsPDF } = window.jspdf;
    const questionInput = document.getElementById('questionInput');
    const submitQuestion = document.getElementById('submitQuestion');
    const languageSelect = document.getElementById('languageSelect');
    const dashboard = document.getElementById('dashboard');
    const sidebar = document.getElementById('sidebar');
    const toggleSidebar = document.getElementById('toggleSidebar');
    const sectionList = document.getElementById('sectionList');
    const content = document.getElementById('content');
    const progressBar = document.getElementById('progressBar');
    const prevSection = document.getElementById('prevSection');
    const nextSection = document.getElementById('nextSection');
    const exportPDF = document.getElementById('exportPDF');
    const closeDashboard = document.getElementById('closeDashboard');
    let sections = [];
    let currentSection = 0;

    const GEMINI_API_KEY = 'AIzaSyBtAVqxOBD_Jk6AxrKEQGnMVkWhcMHNXfc';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent';

    const typingSound = new Audio('https://www.freesoundslibrary.com/wp-content/uploads/2021/09/keyboard-typing-sound-1.mp3');
    typingSound.loop = true;
    typingSound.volume = 0.3;

    // إضافة هذا السطر لضمان إخفاء الـ dashboard عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', () => {
      dashboard.style.display = 'none';
    });

    const systemInstructions = `
    You are Ketab — an elite AI knowledge presentation system developed by Asterix, led by engineer Zeyad Zahran. 
    Your mission is to deliver **highly detailed, accurate, and elegantly structured** knowledge in the form of 
    interactive dashboard presentations for the web.

    You must always maintain a **refined, respectful, and authoritative tone**, suitable for a professional audience. 
    Avoid any casual language or assumptions. Speak with the elegance of a trusted expert and the depth of a certified academic source.

    Your responses must reflect the prestige of Asterix and the precision of its founder. Ensure all information is:
    - Fact-based
    - Deeply explanatory
    - Organized logically
    - Presented beautifully

    The dashboard structure must include:
    - A formal **Introduction**
    - 3–10 **Key Sections** explaining the topic in rich, multi-layered depth
    - A well-structured **Conclusion** summarizing insights

    Each section must contain:
    - A **title** (clear and dignified)
    - **3–4 sentences** of refined, detailed content
    - A suggested **Font Awesome icon** (e.g., fas fa-book)

    Always respond in pure JSON format without any extra characters or text around it.

    Language: Arabic or English.
    `;




    async function fetchDashboardData(question, lang) {
      try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${systemInstructions}\nNow, create a structured presentation for this question: "${question}".`
              }]
            }]
          })
        });
        if (!response.ok) throw new Error(`API request failed: ${response.status}`);
        const data = await response.json();
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```json\n|\n```/g, '');
        const sectionsData = JSON.parse(text);
        return sectionsData.sections || sectionsData;
      } catch (error) {
        console.error('Error fetching data:', error);
        return [
          {
            title: lang === 'ar' ? 'المقدمة' : 'Introduction',
            content: lang === 'ar' ? `هذا العرض يستكشف "${question}". يقدم نظرة شاملة عن الموضوع، مقسمة إلى مفاهيم رئيسية. دعنا نتعمق في التفاصيل!` : `This dashboard explores "${question}". It provides a comprehensive overview of the topic, breaking it down into key concepts. Let's dive into the details!`,
            icon: 'fas fa-book'
          },
          {
            title: lang === 'ar' ? 'النقطة الرئيسية 1' : 'Key Point 1',
            content: lang === 'ar' ? 'يغطي هذا القسم الجانب الرئيسي الأول للموضوع. يشرح العناصر الأساسية بالتفصيل. فهم هذا مهم للسياق العام.' : 'This section covers the first major aspect of the topic. It explains the foundational elements in detail. Understanding this is crucial for the overall context.',
            icon: 'fas fa-list'
          },
          {
            title: lang === 'ar' ? 'النقطة الرئيسية 2' : 'Key Point 2',
            content: lang === 'ar' ? 'هنا، نناقش عنصرًا مهمًا آخر متعلق بسؤالك. يسلط هذا الجزء الضوء على التطبيقات العملية. يربط بين النظرية والسيناريوهات الحقيقية.' : 'Here, we discuss another critical element related to your question. This part highlights practical applications. It connects theory to real-world scenarios.',
            icon: 'fas fa-cog'
          },
          {
            title: lang === 'ar' ? 'الخاتمة' : 'Conclusion',
            content: lang === 'ar' ? 'في الختام، هذا الموضوع معقد ومثير للاهتمام. له تأثيرات واسعة النطاق في مجالات مختلفة. يُوصى بالاستكشاف الإضافي!' : 'In summary, this topic is both complex and fascinating. It has wide-ranging implications for various fields. Further exploration is highly recommended!',
            icon: 'fas fa-star'
          }
        ];
      }
    }

    function typeText(element, text, callback) {
      let i = 0;
      element.innerHTML = '';
      element.classList.add('typing');
      typingSound.play();
      const interval = setInterval(() => {
        if (i < text.length) {
          element.innerHTML += text.charAt(i);
          i++;
        } else {
          clearInterval(interval);
          element.classList.remove('typing');
          element.style.borderRight = 'none';
          typingSound.pause();
          typingSound.currentTime = 0;
          if (callback) callback();
        }
      }, 20);
    }

    function updateProgressBar() {
      const progress = ((currentSection + 1) / sections.length) * 100;
      progressBar.style.width = `${progress}%`;
    }

    function showSection(index) {
      sections.forEach((section, i) => {
        const li = sectionList.children[i];
        li.classList.toggle('active', i === index);
      });
      const section = sections[index];
      content.innerHTML = `
        <div class="progress-bar-container">
          <div class="progress-bar" id="progressBar"></div>
        </div>
        <h2><i class="${section.icon}"></i> ${section.title}</h2>
        <p data-text="${section.content}"></p>
      `;
      const p = content.querySelector('p');
      typeText(p, section.content);
      updateProgressBar();
      prevSection.disabled = index === 0;
      nextSection.disabled = index === sections.length - 1;
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
      }
    }

    function generateDashboard(data) {
      sectionList.innerHTML = '';
      content.innerHTML = '';
      sections = data;
      sections.forEach((section, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="${section.icon}"></i> ${section.title}`;
        li.addEventListener('click', () => {
          currentSection = i;
          showSection(currentSection);
        });
        sectionList.appendChild(li);
      });
      currentSection = 0;
      showSection(currentSection);
    }

    function exportToPDF() {
      const doc = new jsPDF();
      doc.setFont('NotoSansArabic', 'normal');
      let y = 20;
      doc.setFontSize(16);
      doc.text('Dashboard Content', 10, y);
      y += 10;
      sections.forEach((section, i) => {
        doc.setFontSize(14);
        doc.text(`${i + 1}. ${section.title}`, 10, y);
        y += 10;
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(section.content, 180);
        doc.text(splitText, 10, y);
        y += splitText.length * 10 + 10;
      });
      doc.save('dashboard.pdf');
    }

    languageSelect.addEventListener('change', () => {
      document.body.classList.toggle('rtl', languageSelect.value === 'ar');
    });

    submitQuestion.addEventListener('click', async () => {
      const question = questionInput.value.trim();
      if (!question) {
        alert(languageSelect.value === 'ar' ? 'يرجى إدخال سؤال!' : 'Please enter a question!');
        return;
      }
      dashboard.style.display = 'grid';
      const data = await fetchDashboardData(question, languageSelect.value);
      generateDashboard(data);
      document.querySelector('.input-section').style.display = 'none';
    });

    toggleSidebar.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });

    prevSection.addEventListener('click', () => {
      if (currentSection > 0) {
        currentSection--;
        showSection(currentSection);
      }
    });

    nextSection.addEventListener('click', () => {
      if (currentSection < sections.length - 1) {
        currentSection++;
        showSection(currentSection);
      }
    });

    exportPDF.addEventListener('click', exportToPDF);

    closeDashboard.addEventListener('click', () => {
      sectionList.innerHTML = '';
      content.innerHTML = '';
      sections = [];
      currentSection = 0;
      dashboard.style.display = 'none';
      document.querySelector('.input-section').style.display = 'block';
    });