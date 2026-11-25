
const STORE_KEY = "alayric_demo_accounts_v1";
let currentUserId = sessionStorage.getItem("alayric_current_user");
let toastTimer;

const $ = (id) => document.getElementById(id);
const money = (n) => new Intl.NumberFormat("en-IN", {style:"currency",currency:"INR",maximumFractionDigits:2}).format(Number(n)||0);
const safeText = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function getAccounts(){ try{return JSON.parse(localStorage.getItem(STORE_KEY)||"[]");}catch{return [];} }
function saveAccounts(accounts){ localStorage.setItem(STORE_KEY,JSON.stringify(accounts)); }
function currentUser(){return getAccounts().find(a=>a.id===currentUserId)||null;}
function updateUser(mutator){const accounts=getAccounts();const index=accounts.findIndex(a=>a.id===currentUserId);if(index<0)return null;mutator(accounts[index]);saveAccounts(accounts);return accounts[index];}
function showToast(message){const t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2600);}
function setMessage(id,message,success=false){const el=$(id);el.textContent=message;el.classList.toggle("success",success);}
function makeAccountId(){return "AL"+String(Date.now()).slice(-6);}
function switchAuth(mode){document.querySelectorAll(".auth-tab").forEach(b=>b.classList.toggle("active",b.dataset.auth===mode));$("loginPane").hidden=mode!=="login";$("registerPane").hidden=mode!=="register";setMessage("loginMessage","");setMessage("registerMessage","");}
function showAuth(mode="login"){$("authScreen").classList.remove("hidden");switchAuth(mode);}
function showApp(){ $("authScreen").classList.add("hidden"); renderAll(); }
function escapeName(name){return safeText(name||"there");}

function navigate(page){
  const user=currentUser();if(!user){showAuth("login");return;}
  document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+page));
  document.querySelectorAll(".nav-link[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  const labels={dashboard:"Overview",transfer:"Transfer",history:"Transactions",goals:"Savings goals",mentor:"Pocket Mentor",scams:"Scam awareness",profile:"Your profile"};
  $("topbarTitle").textContent=labels[page]||"Overview";
  $("sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
  if(page==="history")renderHistory();
  if(page==="goals")renderGoals();
}
function renderAll(){
 const u=currentUser();if(!u){showAuth();return;}
 $("welcomeName").textContent=u.name.split(" ")[0];$("sideName").textContent=u.name;$("sideAvatar").textContent=u.name.charAt(0).toUpperCase();$("topAvatar").textContent=u.name.charAt(0).toUpperCase();
 $("balanceValue").textContent=money(u.balance);$("accountNumber").textContent=u.accountNumber;$("goalCount").textContent=u.goals.length;$("transferBalance").textContent=money(u.balance);
 $("profileAvatar").textContent=u.name.charAt(0).toUpperCase();$("profileName").textContent=u.name;$("profileEmail").textContent=u.email;$("profileAccount").textContent=u.accountNumber;
 $("detailName").textContent=u.name;$("detailEmail").textContent=u.email;$("detailPhone").textContent=u.phone;$("detailAccount").textContent=u.accountNumber;
 renderRecent();renderDashboardGoals();renderHistory();renderGoals();
}
function renderRecent(){
 const u=currentUser(),el=$("recentTransactions");if(!u)return;
 const list=u.transactions.slice(0,4);
 if(!list.length){el.innerHTML='<div class="empty-state"><span>◷</span><b>No activity yet</b><p>Your recent transactions will appear here.</p></div>';return;}
 el.innerHTML=list.map(t=>`<div class="transaction-row"><div class="transaction-symbol">${t.type==="sent"?"↗":"↙"}</div><div class="transaction-meta"><b>${safeText(t.description|| (t.type==="sent"?"Transfer sent":"Funds received"))}</b><small>${safeText(t.date)} · ${safeText(t.category)}</small></div><div class="transaction-amount ${t.type==="sent"?"negative":"positive"}">${t.type==="sent"?"−":"+"}${money(t.amount)}</div></div>`).join("");
}
function renderDashboardGoals(){
 const u=currentUser(),el=$("dashboardGoals");if(!u)return;
 if(!u.goals.length){el.innerHTML='<div class="empty-inline">No goals yet. Create one and start tracking your progress.</div>';return;}
 el.innerHTML=u.goals.slice(0,3).map(g=>{const p=Math.min(100,Math.round(g.saved/g.target*100));return `<div class="goal-line"><b>${safeText(g.name)}</b><small>${money(g.saved)} / ${money(g.target)}</small><div class="progress-track"><div class="progress-fill" style="width:${p}%"></div></div></div>`;}).join("");
}
function renderHistory(){
 const u=currentUser();if(!u)return;const filter=$("historyFilter")?.value||"all";let items=u.transactions;
 if(filter==="sent"||filter==="received")items=items.filter(t=>t.type===filter);
 if(!items.length){$("historyList").innerHTML='<div class="empty-state"><span>◷</span><b>No transactions found</b><p>Try another filter or make a demo transfer.</p></div>';return;}
 $("historyList").innerHTML=items.map(t=>`<div class="history-item"><div class="transaction-symbol">${t.type==="sent"?"↗":"↙"}</div><div><b>${safeText(t.description|| (t.type==="sent"?"Transfer sent":"Funds received"))}</b><small>${safeText(t.date)} · ${safeText(t.category)} · ${t.type==="sent"?"To":"From"} ${safeText(t.counterparty)}</small></div><div class="history-right"><strong class="${t.type==="sent"?"negative":"positive"}">${t.type==="sent"?"−":"+"}${money(t.amount)}</strong><small>Completed · Demo</small></div></div>`).join("");
}
function renderGoals(){
 const u=currentUser();if(!u)return;$("goalCountBadge").textContent=`${u.goals.length} ${u.goals.length===1?"goal":"goals"}`;
 if(!u.goals.length){$("goalsList").innerHTML='<div class="empty-state"><span>◎</span><b>No savings goals yet</b><p>Create your first goal to see progress here.</p></div>';return;}
 $("goalsList").innerHTML=u.goals.map(g=>{const p=Math.min(100,Math.round(g.saved/g.target*100));return `<div class="goal-item"><div class="goal-item-head"><b>${safeText(g.name)}</b><small>Target: ${safeText(g.deadline)}</small></div><div class="goal-progress-meta"><span>${money(g.saved)} saved of ${money(g.target)}</span><b>${p}%</b></div><div class="progress-track"><div class="progress-fill" style="width:${p}%"></div></div><button data-delete-goal="${g.id}">Remove goal</button></div>`;}).join("");
}
function register(e){
 e.preventDefault();const name=$("registerName").value.trim(),email=$("registerEmail").value.trim().toLowerCase(),phone=$("registerPhone").value.trim(),password=$("registerPassword").value,pin=$("registerPin").value;
 if(name.length<2)return setMessage("registerMessage","Please enter your full name.");
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return setMessage("registerMessage","Enter a valid email address.");
 if(!/^[6-9]\d{9}$/.test(phone))return setMessage("registerMessage","Enter a valid 10-digit Indian mobile number.");
 if(password.length<8)return setMessage("registerMessage","Password must be at least 8 characters.");
 if(!/^\d{4}$/.test(pin))return setMessage("registerMessage","Demo PIN must contain exactly 4 digits.");
 if(!$("registerTerms").checked)return setMessage("registerMessage","Please accept the demo account notice.");
 const accounts=getAccounts();if(accounts.some(a=>a.email===email))return setMessage("registerMessage","An account with this email already exists. Log in instead.");
 const user={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name,email,phone,password,pin,accountNumber:makeAccountId(),balance:5000,goals:[],transactions:[],createdAt:new Date().toISOString()};
 accounts.push(user);saveAccounts(accounts);currentUserId=user.id;sessionStorage.setItem("alayric_current_user",user.id);$("registerForm").reset();showApp();navigate("dashboard");showToast("Your ALAYRIC demo account is ready.");
}
function login(e){
 e.preventDefault();const email=$("loginEmail").value.trim().toLowerCase(),password=$("loginPassword").value;
 const user=getAccounts().find(a=>a.email===email&&a.password===password);
 if(!user)return setMessage("loginMessage","Email or password is incorrect. Try again.");
 currentUserId=user.id;sessionStorage.setItem("alayric_current_user",user.id);$("loginForm").reset();showApp();navigate("dashboard");showToast("Welcome back, "+user.name.split(" ")[0]+".");
}
function transfer(e){
 e.preventDefault();const u=currentUser();if(!u)return;
 const receiver=$("receiver").value.trim().toUpperCase(),amount=Number($("transferAmount").value),category=$("transferCategory").value,description=$("transferDescription").value.trim(),pin=$("transferPin").value;
 if(!/^AL\d{6}$/.test(receiver))return setMessage("transferMessage","Enter a valid demo account ID (for example AL100002).");
 if(receiver===u.accountNumber)return setMessage("transferMessage","You cannot transfer to your own account.");
 if(!Number.isFinite(amount)||amount<=0)return setMessage("transferMessage","Enter an amount greater than zero.");
 if(amount>u.balance)return setMessage("transferMessage","Insufficient demo balance.");
 if(pin!==u.pin)return setMessage("transferMessage","The demo transaction PIN is incorrect.");
 updateUser(a=>{a.balance=Number((a.balance-amount).toFixed(2));a.transactions.unshift({id:Date.now(),type:"sent",amount,category,description:description||"Transfer to "+receiver,counterparty:receiver,date:new Date().toLocaleString("en-IN"),status:"Completed"});});
 $("transferForm").reset();setMessage("transferMessage","Transfer completed in demo mode.",true);renderAll();showToast("Demo transfer recorded.");
}
function createGoal(e){
 e.preventDefault();const name=$("goalName").value.trim(),target=Number($("goalTarget").value),saved=Number($("goalSaved").value),deadline=$("goalDeadline").value;
 if(name.length<2)return setMessage("goalMessage","Give your goal a name.");
 if(target<=0||!Number.isFinite(target))return setMessage("goalMessage","Target must be greater than zero.");
 if(saved<0||saved>target)return setMessage("goalMessage","Saved amount must be between zero and your target.");
 if(!deadline)return setMessage("goalMessage","Choose a target date.");
 updateUser(a=>a.goals.push({id:Date.now(),name,target,saved,deadline}));$("goalForm").reset();$("goalSaved").value="0";setMessage("goalMessage","Savings goal created.",true);renderAll();showToast("New savings goal added.");
}
function removeGoal(id){updateUser(a=>a.goals=a.goals.filter(g=>String(g.id)!==String(id)));renderAll();showToast("Goal removed.");}
const mentorAnswers=[
 [/otp|one.time password/i,"An OTP (one-time password) is a temporary verification code. Never share it with another person, even if they claim to be from a bank or support team."],
 [/upi|unified payments/i,"UPI is a payment system that lets people transfer money between bank accounts through supported apps. A UPI PIN authorises a payment; you should never share it with anyone."],
 [/fake|suspicious|scam|message|link/i,"Check the sender, web address, spelling and tone. Be cautious if a message creates urgency, promises an unexpected reward, asks for a secret code or sends an unfamiliar link. Verify independently using official channels."],
 [/budget|save|saving/i,"A simple starting point is to record money coming in and going out, separate needs from wants, and set a realistic savings target. Review it regularly rather than aiming for perfection."],
 [/credit score|cibil/i,"A credit score is a summary of credit history used by lenders as one factor when assessing credit applications. Paying bills on time and borrowing responsibly can help build a positive history."],
 [/pin|password/i,"Keep PINs and passwords private. Use unique passwords, avoid easy-to-guess combinations and never share one-time codes. This demo should only use invented credentials."],
 [/interest|compound/i,"Interest is the cost of borrowing or the return earned on savings. Compound interest means interest can be calculated on both the original amount and previously earned interest."],
 [/hello|hi|hey/i,"Hello! Ask me about OTPs, UPI, budgeting, savings, credit scores or how to recognise suspicious messages."]
];
function mentorReply(question){
 const q=question.toLowerCase();const match=mentorAnswers.find(([re])=>re.test(q));
 return match?match[1]:"I can help with general topics such as OTPs, UPI, budgeting, savings, credit scores and common scam warning signs. Try asking about one of those. For account-specific issues, contact the relevant organisation through its official channel.";
}
function sendMentor(question){
 const q=question.trim();if(!q)return;if(/password|pin|otp|account number/i.test(q)&&/\b\d{4,}\b/.test(q)){showToast("Please don't share private codes or account details.");return;}
 const windowEl=$("chatWindow");windowEl.insertAdjacentHTML("beforeend",`<div class="chat-bubble user-bubble">${safeText(q)}</div><div class="chat-bubble mentor-bubble">${safeText(mentorReply(q))}</div>`);windowEl.scrollTop=windowEl.scrollHeight;
}
function logout(){currentUserId=null;sessionStorage.removeItem("alayric_current_user");showAuth("login");showToast("You have logged out.");}

document.querySelectorAll("[data-page]").forEach(el=>el.addEventListener("click",()=>navigate(el.dataset.page)));
document.querySelectorAll(".auth-tab").forEach(el=>el.addEventListener("click",()=>switchAuth(el.dataset.auth)));
$("registerForm").addEventListener("submit",register);$("loginForm").addEventListener("submit",login);$("transferForm").addEventListener("submit",transfer);$("goalForm").addEventListener("submit",createGoal);
$("logoutBtn").addEventListener("click",logout);$("historyFilter").addEventListener("change",renderHistory);
$("goalsList").addEventListener("click",e=>{const b=e.target.closest("[data-delete-goal]");if(b)removeGoal(b.dataset.deleteGoal);});
$("mentorForm").addEventListener("submit",e=>{e.preventDefault();sendMentor($("mentorInput").value);$("mentorInput").value="";});
document.querySelectorAll("[data-question]").forEach(b=>b.addEventListener("click",()=>sendMentor(b.dataset.question)));
$("menuBtn").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
$("notifBtn").addEventListener("click",()=>showToast("You're all caught up."));
if(currentUser()){showApp();navigate("dashboard");}else{showAuth("login");}
