'use strict';

// 【管理者用】Googleフォームへ裏側でログを自動送信する関数
function sendLogToAdmin(speaker, content) {
    const formUrl = 'https://docs.google.com/forms/d/1dfA1wjQcNTMmp0mNi2WGd6nyZ5IpJAmA1yQAXSWzTP0/formResponse';
    const formData = new FormData();
    formData.append('entry.165492000', new Date().toLocaleString('ja-JP'));
    formData.append('entry.1315562008', content);
    fetch(formUrl, { method: 'POST', mode: 'no-cors', body: formData })
        .catch(err => console.error('ログ送信エラー:', err));
}

// ロボットからの投稿一覧（最初のウェルカムメッセージと選択肢）
const chatList = {
    1: { text: 'ようこそ「Miomus Chatbot」へ！\n回答品質向上のため、送信内容を記録致します。\n回答品質向上目的以外には使用致しません。', continue: true, option: 'normal' },
    2: { 
        text: { 
            title: 'Q1', 
            question: '何を知りたいですか？下のボタンから選ぶか、質問を入力してください。', 
            // 最初の質問としてQ1の選択肢は上位4件を自動生成
            get choices() {
                return keywordDictionary.slice(0, 4).map(item => item.label);
            }
        }, 
        continue: false, 
        option: 'choices'
    },
};

// キーワードとそれに対応する回答の辞書
const keywordDictionary = [
    {
        label: 'miomusってどこが運営しているのですか？',
        keywords: ['開発者', 'だれ', '誰', '作った', '制作者', '運営元', 'miomusってどこが運営しているのですか？', 'miomusってどこが運営しているのですか?'],
        answer: '「ぴあ応援団」が企画や運営の中心を担い、６つの幹事団体から成る「Miomusネットワーク」が運営しています。',
    },
    {
        label: '「ぴあ応援団」について詳しく教えてください。',
        keywords: ['ぴあ応援団', '「ぴあ応援団」について詳しく教えてください。'],
        answer: '「ぴあ応援団」は、社会的養護（児童福祉施設、里親家庭、ファミリーホーム等）を経験した、30歳以下の若者たちによる当事者活動団体です。後輩たちが希望を持って自分らしく歩める社会を目指し、自立や進学のための情報発信などを行っています。\n「ぴあ応援団」について、詳しく知りたい方は、こちらのページをご覧ください。',
    },
    {
        label: '幹事団体はどんな団体ですか？',
        keywords: ['幹事団体', '幹事団体はどんな団体ですか？', '幹事団体はどんな団体ですか?'],
        answer: '「Miomusネットワーク」の幹事団体は以下の団体です。\n一般社団法人ゼンショーかがやき子ども財団、NPO法人モバイル・コミュニケーション・ファンド、公益財団法人教育支援グローバル基金、公益財団法人資生堂子ども財団、社会福祉法人朝日新聞厚生文化事業団、社会福祉法人東京都社会福祉協議会',
    },
    {
        label: 'このサイトから直接応募ができるのですか？',
        keywords: ['直接応募', '応募方法', 'このサイトから直接応募ができるのですか？', 'このサイトから直接応募ができるのですか?'],
        answer: '現在、このサイトから直接応募することはできません。\nただし、掲載されている奨学金情報の中には、応募先の公式サイトURLや応募ページへのリンクが記載されている場合がありますので、各ページをご確認ください。\nまた、奨学金によってはオンライン応募ではなく、郵送など書類提出のみで受け付けている場合もあります。応募方法は奨学金ごとに異なるため、必ず募集要項を確認したうえでご応募ください。',
    },
    {
        label: '一般家庭の人でも利用できますか？',
        keywords: ['一般家庭', '一般家庭の人でも利用できますか？', '一般家庭の人でも利用できますか?'],
        answer: 'はい。ご利用頂けます。\nただし、現在掲載している奨学金情報は社会的養護出身者向けのものが多くなっています。\nそのため、応募条件や対象者については、各募集要項をよくご確認ください。',
    },
    {
        label: 'いつぐらいからの募集が多いですか？',
        keywords: ['開始', '時期', 'いつぐらいからの募集が多いですか？', 'いつぐらいからの募集が多いですか?'],
        answer: '奨学金の募集は、５月～９月頃に行われることが多いです。\nただし、募集時期は企業や団体によって毎年異なる場合があります。\nそのため、気になる奨学金がある場合は、各団体の公式サイトや募集要項をこまめに確認することをおすすめします。',
    },
    {
        keywords: ['合格前'],
        answer: 'はい。可能です。応募前や応募後に、成績証明書や卒業見込証明書などの提出が必要になる場合があります。詳しくは各奨学金の募集要項をご確認ください。',
    },
    {
        keywords: ['施設', '里親', 'ファミリーホーム'],
        answer: 'はい。多くの奨学金では、児童養護施設、里親家庭、ファミリーホームなど、出身にかかわらず応募することが可能です。詳しくは各奨学金の募集要項をご確認ください。\nまた、児童養護施設、里親家庭、ファミリーホームで暮らす子どもを対象にした奨学金もあり、Miomusでは、その情報を掲載しています。',
    },
    {
        keywords: ['返済'],
        answer: 'はい。児童養護施設、里親家庭、ファミリーホームなど、社会的養護の輪の中で暮らす方向けの奨学金には、返済不要の「給付型奨学金」が多くあります。詳しくは各奨学金の募集要項をご確認ください。',
    },
    {
        keywords: ['専門学校'],
        answer: 'はい。専門学校に進学される方を対象とした奨学金もあります。ただし、奨学金によっては対象外となる場合がありますので、詳しくは各奨学金の募集要項をご確認ください。',
    },
    {
        keywords: ['複数', '同時'],
        answer: 'はい。複数の奨学金に同時に応募できる場合が多いです。\nただし、団体によっては他の奨学金との併給ができないこともあります。応募前に各団体の募集要項をご確認ください。',
    },
    {
        keywords: ['進学後', '少なくなる'],
        answer: 'はい。進学前と比べると、進学後に応募できる奨学金は少なくなる傾向があります。\nそのため、高校在学中の段階で、できるだけ多くの奨学金に応募しておくことをおすすめします。\n一方で、大学・専門学校などに進学した後でも応募できる奨学金や、学校独自の奨学金制度が用意されている場合があります。進学先の学生課や公式サイトなどもあわせて確認してみてください。',
    },
    {
        keywords: ['成績'],
        answer: '申し込みに成績の条件が付く奨学金はほとんどありませんが、受給後の成績が良くない場合、打ち切られる場合があります。\nまた、大学・専門学校独自の奨学金では、進学先での成績が関係してくるものもあります。',
    },
    {
        keywords: ['地方', '都会', '地域', '全国'],
        answer: 'はい。全国対象の奨学金も数多く掲載しています。',
    },
    {
        keywords: ['生活保護'],
        answer: '併用可能です。ただし、奨学金の種類によっては、収入とみなされてしまうケースも見られるため、奨学金申し込み前に担当のケースワーカーさんに確認をいただくことをお勧めします。',
    },
    {
        keywords: ['国の奨学金', 'JASSO', '日本学生支援機構'],
        answer: 'はい。多くの奨学金は日本学生支援機構（JASSO）の奨学金と併用できます。ただし、一部併用できない場合もありますので、募集要項をご確認ください。',
    },
    {
        keywords: ['給付型', '額',],
        answer: '奨学金によって異なります。\n日本学生支援機構（JASSO）の給付型奨学金では、世帯収入や通学形態によって支給額が異なります。\n例えば、私立大学（昼間制）の場合、最大で以下の金額が支給されます（2026年5月現在）。\n自宅通学：42500円/月\n一人暮らしなどの自宅外通学：75800円/月\nさらに、授業料や入学金の減免制度も併せて利用できる場合があります。\n※世帯収入や進学先等によって金額や対象となるかどうかが変わります。\n詳しくは日本学生支援機構（JASSO）の募集要項をご確認ください。',
    },
    {
        keywords: ['障害者'],
        answer: 'はい。社会的養護経験者であれば障害者施設に入所していても使える奨学金はあります。',
    },
    {
        keywords: ['措置延長'],
        answer: 'はい。日本学生支援機構（JASSO）の奨学金をはじめ、多くの場合、措置延長をしながら、奨学金を受けることは可能です。\nただ、措置延長をしていることで、支援内容が変わったり、奨学金によっては条件がある場合もありますので、各企業・団体の募集要項をご確認ください。',
    },
    {
        keywords: ['振込', '振り込み', '入金'],
        answer: '振込時期は奨学金団体によって異なります。毎月振り込まれる場合や、数か月分をまとめて支給される場合があります。詳しくは各団体の案内をご確認ください。',
    },
    {
        keywords: ['親', '連絡'],
        answer: '親と連絡を取る必要はありません。応募にあたって相談が必要な場合は、施設職員の方、里親の方、またはファミリーホームの担当者の方にご相談ください。',
    },
    {
        keywords: ['費用', '初期'],
        answer: '学校によって異なりますが、学費の他に教材費や実習費などがかかる場合があります。\nまた、一人暮らしを始める場合は、家賃に加えて敷金・礼金・仲介手数料などの初期費用必要になることがあります。\nなお、日本学生支援機構（JASSO）の奨学金が、入学後に振り込みが開始される場合が多いため、入学手続き時に必要な費用を事前に確認しておくことが大切です。必要に応じて、学校の分納制度や延納制度についても確認してみてください。',
    },
    {
        keywords: ['給付'],
        answer: '返す必要の無い奨学金のことです。',
    },
    {
        keywords: ['志望', '行きたい'],
        answer: '志望校は、できるだけ早めに決めることをおすすめします。早く決めることで、その学校に合った受験対策や準備を進めやすくなるためです。ただ、進学先の選択は人生の中でも大きな決断になるので、焦って決めるのではなく、自分が納得できるまでじっくり考える事も大切だと思います。',
    },
    {
        keywords: ['作文'],
        answer: 'まずはテーマを読んで、思いついたことを箇条書きで書き出してみましょう。その中から「いちばん伝えたいこと」を中心に文章をまとめると書きやすくなります。不安な場合は身近な大人に相談するのも良いですが、奨学金によっては第三者による添削が認められていない場合がありますので、募集要項をよくご確認ください。',
    },
    {
        keywords: ['添削', '修正', '手直し'],
        answer: '奨学金や学校によっては第三者による添削や修正を禁止している場合もあるため、募集要項をしっかり確認してください。また、添削を受けすぎることで、自分らしさや本当に伝えたい思いが薄れてしまうこともあります。アドバイスを参考にしつつ、最終的には自分自身の言葉で書くことが大切です。',
    },
    {
        keywords: ['面接'],
        answer: '奨学金の申請理由、経済状況、奨学金の用途といった経済的状況や、その大学（短期大学・専門学校）・学部学科の志望理由、研究内容といった奨学金の用途、今までやこれからのこと、自己PRのように実に幅広く質問されます。どのような質問が来ても答えられるようにしておくと良いでしょう。',
    },
    {
        keywords: ['不安', '支援'],
        answer: '不安になることは沢山あると思います。生活環境が変わることで心に負担になることが沢山あると思います。ぜひ、以前生活していた頼れる方々に相談を聞ひとつむことをおすすめします。',
    },
    {
        keywords: ['一人暮らし', '家電', '身の回り'],
        answer: '一人暮らしでの最低限必要な家電は、冷蔵庫、レンジ、炊飯器、洗濯機、そのほか料理用の器具や、掃除用品（ワイパー、コロコロ、バス・トイレ用品など）や寝具などが必要です。その他、机や棚もあると生活しやすいです。',
    },
    {
        keywords: ['アルバイト'],
        answer: '進む学部などによっても様々です。収入としては、実習が少ない学部では、長期休みが稼ぎ時です！通常でも週2日働くだけでも、収入としては安定してきます。',
    },
    {
        keywords: ['遠距離', '遠い'],
        answer: '経済的な不安もあるかと思います。距離が遠いと、引っ越し費用が負担になるかと考えられます。ですが、進学前に受け取れる奨学金も多くあり、準備に使えるものもあります。\nまた、その土地で相談できる人や機関を見つけることも大切です。各地のアフターケア事業所と繋がっていると安心です。',
    },
    {
        keywords: ['貯金'],
        answer: '100万円の貯金は安心できると思います。子ども手当などはぜひ活用してください。',
    },
    {
        keywords: ['種類'],
        answer: '令和8年5月7日現在、50件の奨学金を掲載しています。',
    },
    {
        keywords: ['登録'],
        answer: 'いいえ。登録不要でお使い頂けます。',
    },
    {
        keywords: ['使い方', '使う'],
        answer: '①検討している奨学金の種類によってそれぞれの項目を入力して頂き、「この条件で検索する」を押してください。\n②気になる奨学金をクリックし、詳細をご確認ください。',
    }
];

// リンク用データ
const linkData = [
    'https://example.com/developer',
    'https://hubspot.com',
    'https://example.com/flutter',
    'https://www.town.shimane-misato.lg.jp/'
];

// カウンターと状態の管理
let robotCount = 0;
let isWaitingForSurvey = false; 

// HTML要素の取得
const chatUl = document.getElementById('chatbot-ul');
const chatSubmitBtn = document.getElementById('chatbot-submit');
const userText = document.getElementById('chatbot-text');
const suggestBox = document.getElementById('suggest-box');
const chatBody = document.getElementById('chatbot-body');

// スクロール用共通関数
function scrollToBottom() {
    if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

// ロボットの出力処理
function robotOutput() {
    robotCount++;
    if (robotCount > Object.keys(chatList).length) return;

    const currentChat = chatList[robotCount];

    setTimeout(() => {
        const loadingEl = appendLoading();

        setTimeout(() => {
            loadingEl.remove();

            if (currentChat.option === 'choices') {
                appendChoicesBubble(currentChat.text.title, currentChat.text.question, currentChat.text.choices);
                sendLogToAdmin('ボット', currentChat.text.question);
            } else {
                let text = currentChat.text;
                appendRobotBubble(text);
                sendLogToAdmin('ボット', text);
            }

            if (currentChat.continue) {
                robotOutput();
            }
        }, 1000);
    }, 200);
}

// ユーザーが聞き返しボタンをクリックしたときの処理
function handleClarificationClick(selectedLabel) {
    // 選択されたラベルに完全に一致するデータを辞書から探す
    const matchedItem = keywordDictionary.find(item => item.label === selectedLabel);
    
    // 聞き返しボタンを無効化
    document.querySelectorAll('.clarify-button').forEach(btn => {
        btn.classList.add('choice-button-disabled');
        btn.disabled = true;
    });

    setTimeout(() => {
        const loadingEl = appendLoading();
        setTimeout(() => {
            loadingEl.remove();

            if (matchedItem) {
                appendRobotBubble(matchedItem.answer);
                sendLogToAdmin('ボット(聞き返し回答)', matchedItem.answer);

                // 通常のアンケート表示へ
                setTimeout(() => {
                    appendYesNoBubble('アンケート', 'お返事の内容は、お力になれそうでしょうか？');
                }, 1000);
            }
        }, 1000);
    }, 200);
}

// 一問一答の回答処理（重複ヒット時に聞き返すロジック）
function handleOneQuestionOneAnswer(inputText) {
    const matchedItems = [];

    // 入力文に対してヒットする全てのオブジェクトを抽出
    for (const item of keywordDictionary) {
        const labelMatch = item.label && inputText.includes(item.label);
        const keywordMatch = item.keywords && item.keywords.some(kw => inputText.includes(kw));
        
        if (labelMatch || keywordMatch) {
            if (!matchedItems.includes(item)) {
                matchedItems.push(item);
            }
        }
    }

    setTimeout(() => {
        const loadingEl = appendLoading();
        setTimeout(() => {
            loadingEl.remove();

            // 1. 何もマッチしなかった場合
            if (matchedItems.length === 0) {
                const fallbackMsg = '申し訳ありません。入力されたキーワードに対応する回答が見つかりませんでした。「直接応募」や「返済」など、お知りになりたいキーワードを含めて再度入力してください。';
                appendRobotBubble(fallbackMsg);
                sendLogToAdmin('ボット(該当なし)', fallbackMsg);

                setTimeout(() => {
                    appendYesNoBubble('アンケート', 'お役に立ちましたか？');
                }, 1000);
                return;
            }

            // 2. 複数のキーワードにヒットした場合（labelが定義されているものを基準に判定）
            const itemsWithLabel = matchedItems.filter(item => item.label);
            
            if (itemsWithLabel.length >= 2) {
                const labels = itemsWithLabel.map(item => item.label);
                appendClarificationBubble('質問の確認', '複数のキーワードが含まれているようです。どちらについてお知りになりたいですか？', labels);
                sendLogToAdmin('ボット(聞き返し発生)', labels.join(' | '));
                return;
            }

            // 3. 1つだけマッチした場合
            const targetItem = matchedItems[0];
            const matchedAnswer = targetItem.answer;

            appendRobotBubble(matchedAnswer);
            sendLogToAdmin('ボット(一問一答回答)', matchedAnswer);

            // 出力した回答が「運営者」に関するテキストかどうかをチェック
            if (matchedAnswer.includes('「ぴあ応援団」が企画や運営の中心を担い')) {
                setTimeout(() => {
                    const newChoices = [
                        '「ぴあ応援団」について詳しく教えてください。',
                        '幹事団体はどんな団体ですか？'
                    ];
                    appendChoicesBubble('追加の質問', 'よろしければ、こちらの質問も合わせてご確認ください。', newChoices);
                    
                    setTimeout(() => {
                        appendYesNoBubble('アンケート', 'お返事の内容は、お力になれそうでしょうか？');
                    }, 1000);

                }, 1000);
            } else {
                setTimeout(() => {
                    appendYesNoBubble('アンケート', 'お返事の内容は、お力になれそうでしょうか？');
                }, 1000);
            }
        }, 1000);
    }, 200);
}

// 「はい」「いいえ」式のアンケートカードを表示する関数
function appendYesNoBubble(title, question) {
    isWaitingForSurvey = true; 

    const li = document.createElement('li');
    li.classList.add('chatbot-left-row');

    const img = document.createElement('img');
    img.src = 'robot.png';
    img.alt = 'Robot';
    img.className = 'robot-icon';
    li.appendChild(img);

    const div = document.createElement('div');
    div.className = 'chatbot-left-rounded';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'choice-title';
    titleDiv.textContent = title;
    div.appendChild(titleDiv);

    const qDiv = document.createElement('div');
    qDiv.className = 'choice-q';
    qDiv.textContent = question;
    div.appendChild(qDiv);

    ['はい', 'いいえ'].forEach(choiceText => {
        const btn = document.createElement('button');
        btn.className = 'choice-button survey-button'; 
        btn.textContent = choiceText;
        btn.addEventListener('click', () => {
            userText.value = choiceText;
            chatSubmitBtn.click();
        });
        div.appendChild(btn);
    });

    li.appendChild(div);
    chatUl.appendChild(li);
    scrollToBottom();
}

// アンケートに対する分岐返答処理
function handleSurveyAnswer(inputText) {
    document.querySelectorAll('.survey-button').forEach(btn => {
        btn.classList.add('choice-button-disabled');
        btn.disabled = true;
    });

    setTimeout(() => {
        const loadingEl = appendLoading();
        setTimeout(() => {
            loadingEl.remove();

            let targetMsg = '';
            let targetUrl = '';
            let logStatus = '';

            if (inputText.includes('はい')) {
                targetMsg = 'ありがとうございます。チャットボットでは伝えきれない、私たちからのメッセージや、最新の情報を、公式LINEでお届けしています。ぜひつながってください！\n';
                targetUrl = 'https://lin.ee/teoPHb6';
                logStatus = 'ボット(アンケート回答：はい)';
            } else {
                targetMsg = '下記の問い合わせフォームへご連絡ください！';
                targetUrl = 'https://forms.gle/3WQLoiSUSZBur3Br8';
                logStatus = 'ボット(アンケート回答：いいえ)';
            }

            const fullMsg = targetMsg + targetUrl;

            appendRobotBubble(fullMsg);
            sendLogToAdmin(logStatus, fullMsg);

            const allBubbles = chatUl.querySelectorAll('.chatbot-left');
            if (allBubbles.length > 0) {
                const latestBubble = allBubbles[allBubbles.length - 1];
                let htmlContent = latestBubble.textContent.replace(/\n/g, '<br>');
                htmlContent = htmlContent.replace(
                    targetUrl, 
                    `<a href="${targetUrl}" target="_blank" rel="noopener noreferrer" style="color: #F07A30; font-weight: bold; text-decoration: underline;">${targetUrl}</a>`
                );
                latestBubble.innerHTML = htmlContent;
            }

            isWaitingForSurvey = false; 
        }, 1000);
    }, 200);
}

// サジェストボックスを隠す処理
function hideSuggestBox() {
    suggestBox.innerHTML = '';
    suggestBox.style.display = 'none';
}

// ローディングアニメーションの追加
function appendLoading() {
    const li = document.createElement('li');
    li.classList.add('chatbot-left-row');

    const img = document.createElement('img');
    img.src = 'robot.png';
    img.alt = 'Robot';
    img.className = 'robot-icon';
    li.appendChild(img);

    const div = document.createElement('div');
    div.className = 'chatbot-left';
    div.innerHTML = `
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
    `;
    div.style.display = 'flex';
    div.style.gap = '5px';
    div.style.alignItems = 'center';
    div.style.padding = '14px 18px';
    li.appendChild(div);

    chatUl.appendChild(li);
    scrollToBottom();
    return li;
}

// ロボットの吹き出し追加
function appendRobotBubble(text) {
    const li = document.createElement('li');
    li.classList.add('chatbot-left-row');

    const img = document.createElement('img');
    img.src = 'robot.png';
    img.alt = 'Robot';
    img.className = 'robot-icon';
    li.appendChild(img);

    const div = document.createElement('div');
    div.className = 'chatbot-left';
    div.textContent = text;

    li.appendChild(div);
    chatUl.appendChild(li);
    scrollToBottom();
}

// ロボットの選択肢カード追加
function appendChoicesBubble(title, question, choices) {
    const li = document.createElement('li');
    li.classList.add('chatbot-left-row');

    const img = document.createElement('img');
    img.src = 'robot.png';
    img.alt = 'Robot';
    img.className = 'robot-icon';
    li.appendChild(img);

    const div = document.createElement('div');
    div.className = 'chatbot-left-rounded';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'choice-title';
    titleDiv.textContent = title;
    div.appendChild(titleDiv);

    const qDiv = document.createElement('div');
    qDiv.className = 'choice-q';
    qDiv.textContent = question;
    div.appendChild(qDiv);

    choices.forEach(choiceText => {
        const btn = document.createElement('button');
        btn.className = 'choice-button';
        btn.textContent = choiceText;
        btn.addEventListener('click', () => {
            userText.value = choiceText;
            chatSubmitBtn.click();
        });
        div.appendChild(btn);
    });

    li.appendChild(div);
    chatUl.appendChild(li);
    scrollToBottom();
}

// 聞き返し専用の選択肢カードを表示する関数
function appendClarificationBubble(title, question, choices) {
    const li = document.createElement('li');
    li.classList.add('chatbot-left-row');

    const img = document.createElement('img');
    img.src = 'robot.png';
    img.alt = 'Robot';
    img.className = 'robot-icon';
    li.appendChild(img);

    const div = document.createElement('div');
    div.className = 'chatbot-left-rounded';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'choice-title';
    titleDiv.textContent = title;
    div.appendChild(titleDiv);

    const qDiv = document.createElement('div');
    qDiv.className = 'choice-q';
    qDiv.textContent = question;
    div.appendChild(qDiv);

    choices.forEach(choiceText => {
        const btn = document.createElement('button');
        btn.className = 'choice-button clarify-button'; 
        btn.textContent = choiceText;
        btn.addEventListener('click', () => {
            appendUserBubble(choiceText);
            sendLogToAdmin('ユーザー(聞き返し選択)', choiceText);
            handleClarificationClick(choiceText);
        });
        div.appendChild(btn);
    });

    li.appendChild(div);
    chatUl.appendChild(li);
    scrollToBottom();
}

// ユーザーの吹き出し追加
function appendUserBubble(text) {
    const li = document.createElement('li');
    li.classList.add('chatbot-right-row');

    const div = document.createElement('div');
    div.className = 'chatbot-right';
    div.textContent = text;
    li.appendChild(div);

    chatUl.appendChild(li);
    scrollToBottom();
}

// ユーザーからの送信イベント
chatSubmitBtn.addEventListener('click', () => {
    if (!userText.value || !userText.value.match(/\S/g)) return false;

    const inputText = userText.value.trim();
    userText.value = '';
    hideSuggestBox();

    appendUserBubble(inputText);
    sendLogToAdmin('ユーザー', inputText);

    // 通常のアンケート回答待機中の処理（「はい」「いいえ」が押された時）
    if (isWaitingForSurvey) {
        handleSurveyAnswer(inputText);
    } else {
        // 通常の一問一答処理へ
        handleOneQuestionOneAnswer(inputText);
    }
});

// Enterキーでも送信
userText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        chatSubmitBtn.click();
    }
});

// サジェストボックスの表示処理
userText.addEventListener('input', () => {
    const val = userText.value.trim();
    suggestBox.innerHTML = '';

    if (!val) {
        suggestBox.style.display = 'none';
        return;
    }

    const matched = [];
    for (const item of keywordDictionary) {
        for (const kw of item.keywords) {
            if (kw.includes(val) || val.includes(kw)) {
                if (!matched.includes(kw)) {
                    matched.push(kw);
                    if (matched.length >= 5) break;
                }
            }
        }
        if (matched.length >= 5) break;
    }

    if (matched.length === 0) {
        suggestBox.style.display = 'none';
        return;
    }

    matched.forEach(kw => {
        const btn = document.createElement('button');
        btn.className = 'suggest-btn';
        btn.textContent = kw;
        btn.addEventListener('click', () => {
            userText.value = kw;
            hideSuggestBox();
            chatSubmitBtn.click();
        });
        suggestBox.appendChild(btn);
    });

    suggestBox.style.display = 'block';
});

// 入力欄からフォーカスが外れたらサジェストを閉じる
userText.addEventListener('blur', () => {
    setTimeout(hideSuggestBox, 150);
});

// チャットボット起動
robotOutput();
