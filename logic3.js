
let words = [
  { word: "hello", meaning: "xin chào" }
];

let randomizedWords = [];
let currentIndex = 0;

// Biến cho chế độ kiểm tra
let quizWords = [];
let currentQuizIndex = 0;
let score = 0;
let totalQuestions = 0;
let isAnswerChecked = false;

let leaderboard = JSON.parse(localStorage.getItem('vocabLeaderboard')) || [];
const scoreForm = document.getElementById('score-form');
const finalScoreEl = document.getElementById('final-score');
const finalTotalEl = document.getElementById('final-total');
const finalPercentageEl = document.getElementById('final-percentage');
const playerNameInput = document.getElementById('player-name');
const saveScoreBtn = document.getElementById('save-score-btn');
const cancelSaveBtn = document.getElementById('cancel-save-btn');
const leaderboardEl = document.getElementById('leaderboard');

// DOM Elements
const flashcard = document.getElementById('flashcard');
const frontText = document.querySelector('.front');
const backText = document.querySelector('.back');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const addBtn = document.getElementById('add-btn');
const addWordForm = document.getElementById('add-word-form');
const wordInput = document.getElementById('word');
const meaningInput = document.getElementById('meaning');
const wordList = document.getElementById('word-list');
const progressText = document.getElementById('progress-text');
const notification = document.getElementById('notification');
const wordCount = document.getElementById('word-count');
const emptyList = document.getElementById('empty-list');

// Phần tử chế độ kiểm tra
const flashcardSection = document.getElementById('flashcard-section');
const quizSection = document.getElementById('quiz-section');
const flashcardModeBtn = document.getElementById('flashcard-mode');
const quizModeBtn = document.getElementById('quiz-mode');
const quizWord = document.getElementById('quiz-word');
const answerInput = document.getElementById('answer-input');
const checkAnswerBtn = document.getElementById('check-answer-btn');
const nextQuestionBtn = document.getElementById('next-question-btn');
const answerFeedback = document.getElementById('answer-feedback');
const currentScore = document.getElementById('current-score');
const totalQuestionsEl = document.getElementById('total-questions');
const scoreProgress = document.getElementById('score-progress');

// Hàm hiển thị form lưu điểm
function showScoreForm() {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  finalScoreEl.textContent = score;
  finalTotalEl.textContent = totalQuestions;
  finalPercentageEl.textContent = percentage;
  
  scoreForm.style.display = 'block';
  playerNameInput.focus();
}

// Hàm lưu điểm vào localStorage
function saveScore() {
  const playerName = playerNameInput.value.trim() || 'Ẩn danh';
  const percentage = Math.round((score / totalQuestions) * 100);
  
  leaderboard.push({
    name: playerName,
    score,
    total: totalQuestions,
    percentage,
    date: new Date().toLocaleString()
  });
  
  // Sắp xếp theo tỉ lệ phần trăm giảm dần
  leaderboard.sort((a, b) => b.percentage - a.percentage);
  
  // Chỉ giữ top 10
  leaderboard = leaderboard.slice(0, 10);
  
  localStorage.setItem('vocabLeaderboard', JSON.stringify(leaderboard));
  showNotification(`Đã lưu điểm cho ${playerName}!`);
  scoreForm.style.display = 'none';
  renderLeaderboard();
}

// Hàm hiển thị bảng xếp hạng
function renderLeaderboard() {
  leaderboardEl.innerHTML = '';
  
  if (leaderboard.length === 0) {
    leaderboardEl.innerHTML = `
      <div class="text-center py-4 text-muted">
        Chưa có dữ liệu xếp hạng
      </div>
    `;
    return;
  }
  
  leaderboard.forEach((entry, index) => {
    const item = document.createElement('div');
    item.className = 'list-group-item d-flex justify-content-between align-items-center';
    
    item.innerHTML = `
      <div>
        <span class="badge bg-primary me-2">${index + 1}</span>
        <strong>${entry.name}</strong>
      </div>
      <div class="text-end">
        <div>${entry.score}/${entry.total}</div>
        <small class="text-muted">${entry.percentage}%</small>
      </div>
    `;
    
    leaderboardEl.appendChild(item);
  });
}

// Cập nhật hàm nextQuizQuestion
function nextQuizQuestion() {
  if (quizWords.length === 0) return;
  
  currentQuizIndex = (currentQuizIndex + 1) % quizWords.length;
  
  if (currentQuizIndex === 0) {
    // Hiển thị form lưu điểm khi hoàn thành 1 vòng
    showScoreForm();
    shuffleQuizWords();
    showNotification('Đã hoàn thành một vòng!');
  }
  
  updateQuizQuestion();
}

// Thêm event listeners
if (saveScoreBtn) {
  saveScoreBtn.addEventListener('click', saveScore);
}
if (cancelSaveBtn) {
  cancelSaveBtn.addEventListener('click', () => {
    scoreForm.style.display = 'none';
  });
}
// Hàm xáo trộn thứ tự từ (Fisher-Yates Shuffle)
function shuffleWords() {
  if (words.length === 0) {
    showNotification('Không có từ vựng nào để xáo trộn!', 'error');
    return;
  }
  
  randomizedWords = [...words];
  for (let i = randomizedWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomizedWords[i], randomizedWords[j]] = [randomizedWords[j], randomizedWords[i]];
  }
  currentIndex = 0;
  console.log('Đã xáo trộn thứ tự từ vựng!');
}

// Hàm xáo trộn từ cho chế độ kiểm tra
function shuffleQuizWords() {
  if (words.length === 0) {
    showNotification('Không có từ vựng nào để kiểm tra!', 'error');
    return;
  }
  
  quizWords = [...words];
  for (let i = quizWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [quizWords[i], quizWords[j]] = [quizWords[j], quizWords[i]];
  }
  currentQuizIndex = 0;
  score = 0;
  totalQuestions = 0;
  updateScore();
  console.log('Đã chuẩn bị từ vựng cho chế độ kiểm tra!');
}

// Cập nhật nội dung flashcard
function updateFlashcard() {
  if (randomizedWords.length === 0) {
    frontText.textContent = 'Không có từ vựng';
    backText.textContent = 'Hãy thêm từ mới';
    progressText.textContent = 'Chưa có từ vựng';
    return;
  }
  
  const currentWord = randomizedWords[currentIndex];
  frontText.textContent = currentWord.word;
  backText.textContent = currentWord.meaning;
  progressText.textContent = `Từ ${currentIndex + 1}/${randomizedWords.length}`;
  
  // Reset trạng thái lật thẻ
  flashcard.classList.remove('flipped');
  
  // Highlight từ hiện tại trong danh sách
  renderWordList();
}

// Cập nhật nội dung câu hỏi kiểm tra
function updateQuizQuestion() {
  if (quizWords.length === 0) {
    quizWord.textContent = 'Không có từ vựng';
    answerInput.disabled = true;
    checkAnswerBtn.disabled = true;
    return;
  }
  
  const currentWord = quizWords[currentQuizIndex];
  quizWord.textContent = currentWord.word;
  answerInput.value = '';
  answerInput.disabled = false;
  answerFeedback.textContent = '';
  answerFeedback.className = 'mt-3 fw-bold';
  isAnswerChecked = false;
  
  // Cập nhật trạng thái nút
  checkAnswerBtn.disabled = false;
  nextQuestionBtn.disabled = true;
  
  // Focus vào ô nhập câu trả lời
  setTimeout(() => answerInput.focus(), 100);
}

// Cập nhật điểm số
function updateScore() {
  currentScore.textContent = score;
  totalQuestionsEl.textContent = totalQuestions;
  
  // Tính phần trăm
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  scoreProgress.style.width = `${percentage}%`;
  scoreProgress.setAttribute('aria-valuenow', percentage);
  
  // Đổi màu thanh progress dựa trên điểm
  scoreProgress.className = 'progress-bar';
  if (percentage >= 80) {
    scoreProgress.classList.add('bg-success');
  } else if (percentage >= 60) {
    scoreProgress.classList.add('bg-info');
  } else if (percentage >= 40) {
    scoreProgress.classList.add('bg-warning');
  } else if (totalQuestions > 0) {
    scoreProgress.classList.add('bg-danger');
  } else {
    scoreProgress.classList.add('bg-primary');
  }
}

// Kiểm tra câu trả lời
function checkAnswer() {
  if (isAnswerChecked || quizWords.length === 0) return;
  
  const userAnswer = answerInput.value.trim().toLowerCase();
  const correctAnswer = quizWords[currentQuizIndex].meaning.toLowerCase();
  
  totalQuestions++;
  
  if (userAnswer === correctAnswer) {
    score++;
    answerFeedback.textContent = '✅ Chính xác!';
    answerFeedback.className = 'mt-3 fw-bold text-success animate__animated animate__pulse';
  } else {
    answerFeedback.textContent = `❌ Sai! Đáp án đúng là: "${quizWords[currentQuizIndex].meaning}"`;
    answerFeedback.className = 'mt-3 fw-bold text-danger animate__animated animate__headShake';
  }
  
  isAnswerChecked = true;
  updateScore();
  
  // Cập nhật trạng thái nút
  checkAnswerBtn.disabled = true;
  nextQuestionBtn.disabled = false;
  
  // Focus vào nút tiếp theo
  nextQuestionBtn.focus();
}

// Chuyển sang câu hỏi tiếp theo
function nextQuizQuestion() {
  if (quizWords.length === 0) return;
  
  currentQuizIndex = (currentQuizIndex + 1) % quizWords.length;
  
  // Nếu đã hết vòng, xáo trộn lại
  if (currentQuizIndex === 0) {
    shuffleQuizWords();
    showNotification('Đã hoàn thành một vòng! Xáo trộn lại thứ tự!');
  }
  
  updateQuizQuestion();
}

// Chuyển đổi giữa chế độ flashcard và kiểm tra
function switchMode(mode) {
  if (mode === 'flashcard') {
    flashcardSection.style.display = 'block';
    quizSection.style.display = 'none';
    flashcardModeBtn.classList.add('active', 'btn-primary');
    flashcardModeBtn.classList.remove('btn-outline-primary');
    quizModeBtn.classList.remove('active', 'btn-primary');
    quizModeBtn.classList.add('btn-outline-primary');
  } else if (mode === 'quiz') {
    flashcardSection.style.display = 'none';
    quizSection.style.display = 'block';
    quizModeBtn.classList.add('active', 'btn-primary');
    quizModeBtn.classList.remove('btn-outline-primary');
    flashcardModeBtn.classList.remove('active', 'btn-primary');
    flashcardModeBtn.classList.add('btn-outline-primary');
    
    // Chuẩn bị cho chế độ kiểm tra
    shuffleQuizWords();
    updateQuizQuestion();
  }
}

// Cập nhật số lượng từ
function updateWordCount() {
  wordCount.textContent = `${words.length} từ`;
  
  if (words.length === 0) {
    emptyList.style.display = 'block';
    wordList.style.display = 'none';
  } else {
    emptyList.style.display = 'none';
    wordList.style.display = 'block';
  }
}

// Hiển thị danh sách từ
function renderWordList() {
  wordList.innerHTML = '';
  updateWordCount();
  
  if (words.length === 0) return;
  
  words.forEach((item, index) => {
    const li = document.createElement('div');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    
    // Highlight từ hiện tại trong flashcard
    if (randomizedWords.length > 0 && 
        randomizedWords[currentIndex] &&
        item.word === randomizedWords[currentIndex].word && 
        item.meaning === randomizedWords[currentIndex].meaning) {
      li.classList.add('active');
    }
    
    li.innerHTML = `
      <span><strong>${escapeHtml(item.word)}</strong> - ${escapeHtml(item.meaning)}</span>
      <button class="btn btn-sm btn-outline-danger delete-btn" data-index="${index}" title="Xóa từ này">
        🗑️
      </button>
    `;
    
    wordList.appendChild(li);
  });
  
  // Thêm event listener cho nút xóa
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const index = parseInt(e.target.getAttribute('data-index'));
      deleteWord(index);
    });
  });
}

// Escape HTML để tránh XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Xóa từ
function deleteWord(index) {
  if (index < 0 || index >= words.length) return;
  
  const deletedWord = words[index];
  words.splice(index, 1);
  
  // Cập nhật lại các mảng
  shuffleWords();
  if (words.length > 0) {
    updateFlashcard();
  } else {
    // Nếu không còn từ nào
    randomizedWords = [];
    updateFlashcard();
  }
  
  renderWordList();
  showNotification(`Đã xóa từ "${deletedWord.word}"!`);
}

// Hiển thị thông báo
function showNotification(message, type = 'success') {
  notification.textContent = message;
  notification.className = `notification ${type === 'success' ? 'bg-success' : 'bg-danger'} show`;
  
  // Tự động ẩn sau 3 giây
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Thêm từ mới
function addNewWord() {
  const newWord = wordInput.value.trim();
  const newMeaning = meaningInput.value.trim();
  
  if (!newWord || !newMeaning) {
    showNotification('Vui lòng nhập đầy đủ từ vựng và nghĩa!', 'error');
    wordInput.focus();
    return;
  }
  
  // Kiểm tra từ đã tồn tại
  const exists = words.some(item => 
    item.word.toLowerCase() === newWord.toLowerCase()
  );
  
  if (exists) {
    showNotification('Từ này đã tồn tại!', 'error');
    wordInput.focus();
    wordInput.select();
    return;
  }
  
  // Thêm từ mới
  words.push({ word: newWord, meaning: newMeaning });
  
  // Cập nhật lại
  shuffleWords();
  updateFlashcard();
  renderWordList();
  
  // Reset form
  wordInput.value = '';
  meaningInput.value = '';
  wordInput.focus();
  
  showNotification(`Đã thêm từ "${newWord}"!`);
}

// Event Listeners
if (flashcard) {
  flashcard.addEventListener('click', () => {
    if (randomizedWords.length > 0) {
      flashcard.classList.toggle('flipped');
    }
  });
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    if (randomizedWords.length === 0) return;
    
    currentIndex = (currentIndex + 1) % randomizedWords.length;
    updateFlashcard();
    
    if (currentIndex === 0) {
      setTimeout(() => {
        shuffleWords();
        updateFlashcard();
        showNotification('Đã hoàn thành một vòng! Xáo trộn lại thứ tự từ vựng!');
      }, 500);
    }
  });
}

if (shuffleBtn) {
  shuffleBtn.addEventListener('click', () => {
    shuffleWords();
    updateFlashcard();
    showNotification('Đã xáo trộn lại thứ tự từ vựng!');
  });
}

// Form submit event
if (addWordForm) {
  addWordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addNewWord();
  });
}

// Event listener cho phím Enter trong input
if (wordInput) {
  wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      meaningInput.focus();
    }
  });
}

if (meaningInput) {
  meaningInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewWord();
    }
  });
}

// Event listener cho chế độ kiểm tra
if (flashcardModeBtn) {
  flashcardModeBtn.addEventListener('click', () => switchMode('flashcard'));
}

if (quizModeBtn) {
  quizModeBtn.addEventListener('click', () => switchMode('quiz'));
}

if (checkAnswerBtn) {
  checkAnswerBtn.addEventListener('click', checkAnswer);
}

if (nextQuestionBtn) {
  nextQuestionBtn.addEventListener('click', nextQuizQuestion);
}

// Event listener cho ô nhập câu trả lời
if (answerInput) {
  answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isAnswerChecked) {
        checkAnswer();
      } else {
        nextQuizQuestion();
      }
    }
  });
}

// Event listener cho phím tắt
document.addEventListener('keydown', (e) => {
  // Chỉ áp dụng phím tắt khi không đang nhập text
  if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') {
    return;
  }
  
  switch(e.key) {
    case ' ': // Spacebar để lật thẻ
      e.preventDefault();
      if (flashcardSection.style.display !== 'none' && flashcard) {
        flashcard.classList.toggle('flipped');
      }
      break;
      
    case 'ArrowRight': // Mũi tên phải
      e.preventDefault();
      if (quizSection.style.display !== 'none' && isAnswerChecked) {
        nextQuizQuestion();
      } else if (flashcardSection.style.display !== 'none' && nextBtn) {
        nextBtn.click();
      }
      break;
      
    case 'Enter': // Enter
      e.preventDefault();
      if (quizSection.style.display !== 'none') {
        if (!isAnswerChecked) {
          checkAnswer();
        } else {
          nextQuizQuestion();
        }
      }
      break;
      
    case 'r':
    case 'R':
      if (e.ctrlKey || e.metaKey) { // Ctrl+R hoặc Cmd+R
        e.preventDefault();
        if (quizSection.style.display !== 'none') {
          shuffleQuizWords();
          updateQuizQuestion();
          showNotification('Đã xáo trộn lại từ vựng cho kiểm tra!');
        } else if (shuffleBtn) {
          shuffleBtn.click();
        }
      }
      break;
  }
});

// Khởi tạo ứng dụng
function initApp() {
  try {
    shuffleWords();
    updateFlashcard();
    renderWordList();
    renderLeaderboard();
    shuffleWords();
    updateFlashcard();
    renderWordList();
    
    // Chuẩn bị cho chế độ kiểm tra
    shuffleQuizWords();
    
    showNotification('🎌 Chào mừng bạn đến với ứng dụng học tiếng Nhật!');
    
    console.log('🎌 Website học tiếng Nhật đã sẵn sàng!');
    console.log('💡 Mẹo: Dùng phím Space để lật thẻ, Enter/→ để sang từ tiếp theo, Ctrl+R để xáo trộn!');
    console.log('💡 Chế độ kiểm tra: Nhập nghĩa và nhấn Enter để kiểm tra!');
  } catch (error) {
    console.error('Lỗi khởi tạo ứng dụng:', error);
    showNotification('Có lỗi xảy ra khi khởi tạo ứng dụng!', 'error');
  }
}

// Thêm lắng nghe phím Enter cho input tên
if (playerNameInput) {
  playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveScore();
    }
  });
}

// Chạy ứng dụng khi tải xong
document.addEventListener('DOMContentLoaded', initApp);

// Hàm import dữ liệu từ file JSON
async function importFromJSON(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (data.words && Array.isArray(data.words)) {
      // Kiểm tra và thêm từ mới (tránh trùng lặp)
      let addedCount = 0;
      data.words.forEach(newWord => {
        if (newWord.word && newWord.meaning) {
          const exists = words.some(item => 
            item.word.toLowerCase() === newWord.word.toLowerCase()
          );
          if (!exists) {
            words.push({
              word: newWord.word,
              meaning: newWord.meaning,
              category: newWord.category || 'general'
            });
            addedCount++;
          }
        }
      });
      
      // Cập nhật giao diện
      shuffleWords();
      updateFlashcard();
      renderWordList();
      
      showNotification(`Đã import ${addedCount} từ mới từ file!`);
      console.log(`Imported ${addedCount} new words`);
    } else {
      throw new Error('File không đúng định dạng');
    }
  } catch (error) {
    console.error('Lỗi import file:', error);
    showNotification('Lỗi khi import file! Vui lòng kiểm tra định dạng.', 'error');
  }
}

// Hàm import dữ liệu từ file CSV
async function importFromCSV(file) {
  try {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    
    let addedCount = 0;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        if (values.length >= 2) {
          const word = values[0].trim();
          const meaning = values[1].trim();
          const category = values[2] ? values[2].trim() : 'general';
          
          if (word && meaning) {
            const exists = words.some(item => 
              item.word.toLowerCase() === word.toLowerCase()
            );
            if (!exists) {
              words.push({ word, meaning, category });
              addedCount++;
            }
          }
        }
      }
    }
    
    // Cập nhật giao diện
    shuffleWords();
    updateFlashcard();
    renderWordList();
    
    showNotification(`Đã import ${addedCount} từ mới từ file CSV!`);
    console.log(`Imported ${addedCount} new words from CSV`);
  } catch (error) {
    console.error('Lỗi import CSV:', error);
    showNotification('Lỗi khi import file CSV!', 'error');
  }
}

// Hàm export dữ liệu ra file JSON
function exportToJSON() {
  try {
    const data = {
      words: words.map(word => ({
        word: word.word,
        meaning: word.meaning,
        category: word.category || 'general'
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `japanese-words-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification(`Đã export ${words.length} từ ra file JSON!`);
  } catch (error) {
    console.error('Lỗi export:', error);
    showNotification('Lỗi khi export file!', 'error');
  }
}

// Hàm export dữ liệu ra file CSV
function exportToCSV() {
  try {
    let csv = 'word,meaning,category\n';
    words.forEach(word => {
      csv += `"${word.word}","${word.meaning}","${word.category || 'general'}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `japanese-words-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification(`Đã export ${words.length} từ ra file CSV!`);
  } catch (error) {
    console.error('Lỗi export CSV:', error);
    showNotification('Lỗi khi export file CSV!', 'error');
  }
}

// Hàm load dữ liệu từ file mẫu
async function loadSampleData() {
  try {
    const response = await fetch('data/japanese-words.json');
    if (response.ok) {
      const data = await response.json();
      if (data.words && Array.isArray(data.words)) {
        // Thêm từ mẫu nếu chưa có
        let addedCount = 0;
        data.words.forEach(newWord => {
          const exists = words.some(item => 
            item.word.toLowerCase() === newWord.word.toLowerCase()
          );
          if (!exists) {
            words.push({
              word: newWord.word,
              meaning: newWord.meaning,
              category: newWord.category || 'general'
            });
            addedCount++;
          }
        });
        
        if (addedCount > 0) {
          shuffleWords();
          updateFlashcard();
          renderWordList();
          showNotification(`Đã tải ${addedCount} từ mẫu!`);
        } else {
          showNotification('Tất cả từ mẫu đã có sẵn!');
        }
      }
    }
  } catch (error) {
    console.error('Lỗi tải dữ liệu mẫu:', error);
    showNotification('Không thể tải dữ liệu mẫu. Vui lòng kiểm tra file data/japanese-words.json', 'error');
  }
}

// Hàm xử lý import file
function handleFileImport(input, type) {
  const file = input.files[0];
  if (!file) return;
  
  if (type === 'json') {
    importFromJSON(file);
  } else if (type === 'csv') {
    importFromCSV(file);
  }
  
  // Reset input để có thể chọn lại file
  input.value = '';
}