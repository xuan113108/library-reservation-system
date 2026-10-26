const initialBooks = [
  {id:1,title:"資料庫系統概論",author:"陳老師",isbn:"9789570001001",category:"資訊工程",publisher:"學習出版社",date:"2024-08-01",quantity:3,available:2,location:"三樓 A 區",color:"#5279a4"},
  {id:2,title:"設計的心理學",author:"Donald Norman",isbn:"9789570001002",category:"設計",publisher:"遠流出版",date:"2023-05-16",quantity:2,available:0,location:"二樓 D 區",color:"#c37e5c"},
  {id:3,title:"深入淺出 JavaScript",author:"李明",isbn:"9789570001003",category:"資訊工程",publisher:"旗標出版",date:"2022-11-20",quantity:4,available:4,location:"三樓 B 區",color:"#65866a"},
  {id:4,title:"海洋生態與保育",author:"林海洋",isbn:"9789570001004",category:"自然科學",publisher:"自然出版社",date:"2024-02-10",quantity:2,available:0,location:"二樓 C 區",color:"#7d72a8"},
  {id:5,title:"使用者介面設計",author:"王小美",isbn:"9789570001005",category:"設計",publisher:"創意出版",date:"2025-01-05",quantity:5,available:3,location:"三樓 A 區",color:"#b69a55"},
  {id:6,title:"Python 程式設計入門",author:"周文中",isbn:"9789570001006",category:"資訊工程",publisher:"旗標出版",date:"2025-03-12",quantity:4,available:1,location:"三樓 C 區",color:"#477f82"}
];
const load = (key, fallback) => { try { const x=JSON.parse(localStorage.getItem(key)); return x ?? fallback; } catch { return fallback; } };
let books = load("libraryBooks", initialBooks);
let loans = load("libraryLoans", []);
let bookReservations = load("libraryBookReservations", []);
let roomReservations = load("libraryRoomReservations", []);
let filter = "全部", recordTab = "loans";
const $ = id => document.getElementById(id);
const save = () => {
  localStorage.setItem("libraryBooks",JSON.stringify(books));
  localStorage.setItem("libraryLoans",JSON.stringify(loans));
  localStorage.setItem("libraryBookReservations",JSON.stringify(bookReservations));
  localStorage.setItem("libraryRoomReservations",JSON.stringify(roomReservations));
};
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2600);}
function showView(id){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===id));if(id==="books")renderBooks();if(id==="records")renderRecords();window.scrollTo({top:0,behavior:"smooth"});}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.goto)));
function renderBooks(){
  const q=$("bookSearch").value.trim().toLowerCase();
  const filtered=books.filter(b=>{
    const matches=[b.title,b.author,b.isbn,b.category,b.publisher].some(x=>String(x).toLowerCase().includes(q));
    const status=filter==="全部"||(filter==="可借閱"&&b.available>0)||(filter==="可預約"&&b.available===0);
    return matches&&status;
  });
  $("resultCount").textContent=`共 ${filtered.length} 本`;
  $("bookList").innerHTML=filtered.length?filtered.map(b=>`<article class="book-card">
    <div class="book-top"><div class="book-cover" style="background:${b.color}">▤</div><span class="status ${b.available===0?"wait":""}">${b.available>0?"可借閱":"可預約"}</span></div>
    <h3>${escapeHtml(b.title)}</h3><p>${escapeHtml(b.author)} 著</p>
    <div class="book-meta">分類：${escapeHtml(b.category)}<br>出版社：${escapeHtml(b.publisher)}<br>館藏：${b.available}/${b.quantity} 本可借<br>位置：${escapeHtml(b.location)}</div>
    <div class="book-actions">${b.available>0?`<button class="small-btn main" onclick="borrowBook(${b.id})">借閱</button>`:`<button class="small-btn main" onclick="reserveBook(${b.id})">預約</button>`}<button class="small-btn" onclick="showBookInfo(${b.id})">詳細資料</button></div>
  </article>`).join(""):'<div class="empty">找不到符合條件的書籍。<br>試試其他關鍵字或篩選條件。</div>';
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function borrowBook(id){const b=books.find(x=>x.id===id);if(!b||b.available<1){toast("目前沒有可借閱的館藏，請改為預約。");return;}b.available--;const now=new Date();const due=new Date(now);due.setDate(due.getDate()+30);loans.unshift({id:Date.now(),bookId:id,title:b.title,borrowDate:dateStr(now),dueDate:dateStr(due),returnDate:null,status:"借閱中"});save();renderBooks();toast("借閱成功！已新增借閱紀錄。");}
function reserveBook(id){const b=books.find(x=>x.id===id);if(!b)return;if(bookReservations.some(r=>r.bookId===id&&r.status==="預約中")){toast("你已經預約過這本書了。");return;}bookReservations.unshift({id:Date.now(),bookId:id,title:b.title,date:dateStr(new Date()),expiry:"取書期限以圖書館規定為準",status:"預約中"});save();renderBooks();toast("書籍預約成功！");}
function showBookInfo(id){const b=books.find(x=>x.id===id);alert(`書名：${b.title}\n作者：${b.author}\nISBN：${b.isbn}\n出版社：${b.publisher}\n出版日期：${b.date}\n分類：${b.category}\n館藏數量：${b.quantity}\n可借數量：${b.available}\n存放位置：${b.location}`);}
function dateStr(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
$("searchBtn").addEventListener("click",renderBooks);$("bookSearch").addEventListener("input",renderBooks);
document.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",()=>{filter=b.dataset.filter;document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("selected",x===b));renderBooks();}));
$("roomDate").min=dateStr(new Date());$("roomDate").value=dateStr(new Date());
$("roomForm").addEventListener("submit",e=>{
  e.preventDefault();const date=$("roomDate").value,room=$("roomSelect").value,start=$("roomTime").value,duration=Number($("duration").value);
  const startMin=Number(start.slice(0,2))*60+Number(start.slice(3)),endMin=startMin+duration*60;
  const overlaps=roomReservations.some(r=>r.status==="預約中"&&r.date===date&&r.room===room&&startMin<r.endMin&&endMin>r.startMin);
  if(overlaps){toast("這個時段已被預約，請選擇其他時間。");return;}
  const id=Date.now();roomReservations.unshift({id,date,room,roomName:`討論室 ${room}`,start,end:`${String(Math.floor(endMin/60)).padStart(2,"0")}:${String(endMin%60).padStart(2,"0")}`,startMin,endMin,purpose:$("roomPurpose").value.trim(),status:"預約中"});
  save();$("roomPurpose").value="";renderRecords();toast("討論室預約成功！");showView("records");recordTab="roomReservations";document.querySelectorAll("[data-record]").forEach(x=>x.classList.toggle("selected",x.dataset.record===recordTab));renderRecords();
});
document.querySelectorAll("[data-record]").forEach(b=>b.addEventListener("click",()=>{recordTab=b.dataset.record;document.querySelectorAll("[data-record]").forEach(x=>x.classList.toggle("selected",x===b));renderRecords();}));
function renderRecords(){
  const data=recordTab==="loans"?loans:recordTab==="bookReservations"?bookReservations:roomReservations;
  if(!data.length){$("recordList").innerHTML='<div class="empty">目前沒有紀錄。<br>你可以先到書籍查詢或討論室預約頁試試看。</div>';return;}
  $("recordList").innerHTML=data.map(r=>{
    const isLoan=recordTab==="loans",isBook=recordTab==="bookReservations";
    const title=isLoan?r.title:isBook?r.title:`${r.roomName}｜${r.date}`;
    const detail=isLoan?`借閱日期：${r.borrowDate}　應還日期：${r.dueDate}${r.returnDate?`　歸還日期：${r.returnDate}`:""}`:isBook?`預約日期：${r.date}　${r.expiry}`:`時間：${r.start}–${r.end}${r.purpose?`　用途：${escapeHtml(r.purpose)}`:""}`;
    const canCancel=r.status==="預約中";
    return `<article class="record-card"><div><b>${escapeHtml(title)}</b><p>${detail}</p></div><div class="record-actions"><span class="status ${r.status==="已歸還"||r.status==="已取消"?"wait":""}">${escapeHtml(r.status)}</span>${isLoan&&r.status==="借閱中"?`<button class="small-btn" onclick="returnBook(${r.id})">歸還</button>`:""}${!isLoan&&canCancel?`<button class="small-btn" onclick="cancelRecord('${recordTab}',${r.id})">取消預約</button>`:""}</div></article>`;
  }).join("");
}
function returnBook(id){const r=loans.find(x=>x.id===id);if(!r||r.status!=="借閱中")return;r.status="已歸還";r.returnDate=dateStr(new Date());const b=books.find(x=>x.id===r.bookId);if(b)b.available=Math.min(b.quantity,b.available+1);save();renderRecords();toast("還書完成！");}
function cancelRecord(type,id){const list=type==="bookReservations"?bookReservations:roomReservations;const r=list.find(x=>x.id===id);if(!r)return;r.status="已取消";save();renderRecords();toast("已取消預約。");}
renderBooks();renderRecords();
