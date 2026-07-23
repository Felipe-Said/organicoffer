import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const domain = "https://receitasdavovotereza.site";

const categories = [
  ["digestivo", "Digestão e intestino", "Saúde natural"],
  ["figado-rins", "Fígado e rins", "Saúde natural"],
  ["energia-foco", "Energia e foco", "Bem-estar"],
  ["pele-beleza", "Pele, cabelo e beleza", "Bem-estar"],
  ["circulacao", "Circulação e coração", "Saúde natural"],
  ["sono-estresse", "Sono e estresse", "Bem-estar"],
  ["imunidade-respiracao", "Imunidade e respiração", "Saúde natural"],
  ["ossos-articulacoes", "Ossos e articulações", "Bem-estar"],
  ["cuidados-essenciais", "Cuidados essenciais", "Saúde natural"]
];

// Cada pauta corresponde a um preparo do livro. O texto público informa contexto e
// segurança, mas deixa a receita completa para o produto, evitando reproduzir o e-book.
const posts = [
  ["digestivo","Gases e má digestão: o que pode ajudar no dia a dia","gases-ma-digestao-o-que-ajuda","hortelã","folhas de hortelã e água","desconforto após as refeições, estufamento e digestão lenta","Dor intensa, vômitos persistentes, sangue nas fezes ou perda de peso exigem avaliação médica."],
  ["digestivo","Azia e inchaço: hábitos e ingredientes para conhecer","azia-inchaco-habitos-ingredientes","erva-doce","sementes de erva-doce e água","queimação ocasional, sensação de estômago cheio e gases","Azia frequente, dificuldade para engolir ou dor no peito não deve ser tratada apenas em casa."],
  ["digestivo","Gastrite e refluxo: cuidados antes de usar espinheira-santa","gastrite-refluxo-espinheira-santa","espinheira-santa","folhas secas de espinheira-santa e água","irritação gástrica e refluxo","O diagnóstico é médico. Gestantes, lactantes e pessoas que usam remédios contínuos devem consultar um profissional."],
  ["digestivo","Digestão pesada depois de comer: onde o boldo entra","digestao-pesada-boldo-cuidados","boldo","folhas de boldo e água","peso no estômago e desconforto após refeições gordurosas","Evite uso prolongado e não use para mascarar dor forte. Gestantes e pessoas com doença hepática ou obstrução biliar precisam de orientação."],
  ["digestivo","Folha de louro ajuda na digestão? O que saber","folha-de-louro-digestao-glicemia","louro","folhas de louro e água","gases e digestão após refeições","Chá não substitui tratamento do diabetes nem permite alterar medicação. Monitore a glicemia com orientação profissional."],
  ["digestivo","Digestão difícil e losna: benefícios alegados e riscos","losna-digestao-dificil-riscos","losna","folhas secas de losna e água","falta de apetite e desconforto digestivo","A losna pode ser tóxica em excesso e não é indicada para gestantes, lactantes, crianças ou pessoas com histórico de convulsões."],
  ["digestivo","Constipação ocasional: quando o chá de sene pode ser um problema","constipacao-cha-de-sene-uso-seguro","sene","folhas secas de sene e água","prisão de ventre ocasional","Sene é laxante estimulante para uso curto. Dor abdominal, constipação persistente ou necessidade frequente exigem avaliação; o abuso pode causar desequilíbrio de eletrólitos."],
  ["figado-rins","Como cuidar do fígado sem cair em promessas de detox","saude-do-figado-alcachofra-sem-detox","alcachofra","folhas secas de alcachofra e água","digestão de gorduras e cuidados gerais com o fígado","Pele amarelada, urina escura ou dor abdominal precisam de atendimento. Nenhum chá “limpa” sozinho um fígado doente."],
  ["figado-rins","Pedra nos rins e quebra-pedra: o que é mito e o que é cuidado","pedra-nos-rins-quebra-pedra-cuidados","quebra-pedra","folhas e talos de quebra-pedra e água","hidratação e desconfortos urinários associados a cálculos","Cólica renal intensa, febre, vômitos ou dificuldade para urinar são urgências. A bebida não substitui exames nem tratamento."],
  ["figado-rins","Água com cúrcuma e limão: vale chamar de detox?","curcuma-limao-detox-mitos","cúrcuma e limão","água, limão, cúrcuma e, opcionalmente, pimenta-do-reino","uma rotina matinal de hidratação","“Detox” é um termo de marketing: fígado e rins fazem esse trabalho. Cúrcuma pode interagir com anticoagulantes e causar desconforto gastrointestinal."],
  ["figado-rins","Retenção de líquidos: cuidados com dente-de-leão","retencao-liquidos-dente-de-leao","dente-de-leão","folhas e raízes secas de dente-de-leão e água","inchaço leve e sensação de retenção","Inchaço súbito, falta de ar ou doença renal/cardíaca exige avaliação. Diuréticos naturais podem interagir com medicamentos."],
  ["figado-rins","Chá de salsa é diurético? O que considerar antes de usar","cha-de-salsa-diuretico-cuidados","salsa","salsa fresca e água","hidratação e retenção leve de líquidos","Não use em grande quantidade na gestação ou para substituir diuréticos prescritos. Doença renal requer orientação individual."],
  ["figado-rins","Jurubeba para fígado e estômago: uso tradicional e cautela","jurubeba-figado-estomago","jurubeba","folhas secas de jurubeba e água","desconforto digestivo e uso tradicional amargo","Evite uso prolongado ou sem identificação correta da planta. Sintomas hepáticos precisam de diagnóstico."],
  ["figado-rins","Icterícia não se trata com chá: entenda o papel tradicional do picão-preto","ictericia-picao-preto-alerta","picão-preto","folhas e talos de picão-preto e água","o uso tradicional da planta no cuidado digestivo","Olhos ou pele amarelados podem indicar doença séria e exigem atendimento médico rápido; chá não é tratamento para icterícia."],
  ["energia-foco","Cansaço no dia a dia: gengibre com limão dá energia?","cansaco-gengibre-limao-energia","gengibre e limão","gengibre, limão, água e mel opcional","disposição, hidratação e desconforto digestivo leve","Cansaço persistente pode estar ligado a anemia, sono, tireoide ou outras condições. Gengibre pode interagir com anticoagulantes."],
  ["energia-foco","Alecrim melhora foco e memória? Como interpretar essa ideia","alecrim-foco-memoria","alecrim","folhas de alecrim e água","ritual de pausa, aroma e concentração","Queixas novas ou progressivas de memória merecem avaliação. O chá não trata demência nem substitui sono adequado."],
  ["energia-foco","Suco de beterraba e circulação: por que os nitratos chamam atenção","suco-beterraba-circulacao-energia","beterraba e limão","beterraba, limão e água","alimentação, atividade física e circulação","Quem tem tendência a cálculos por oxalato ou pressão baixa deve conversar com um profissional."],
  ["energia-foco","Chá verde com hortelã: cafeína, metabolismo e cuidados","cha-verde-hortela-metabolismo","chá verde e hortelã","folhas de chá verde, hortelã e água","energia e digestão leve","Cafeína pode piorar ansiedade, palpitações, refluxo e insônia. Não existe bebida que, sozinha, cause emagrecimento relevante."],
  ["energia-foco","Guaraná em pó para energia: quanto cuidado a cafeína pede","guarana-energia-cafeina-cuidados","guaraná","pó de guaraná e água","estado de alerta e fadiga ocasional","Evite combinar com energéticos. Pessoas com arritmia, pressão alta, ansiedade, gravidez ou sensibilidade à cafeína precisam de orientação."],
  ["energia-foco","Ginseng e vitalidade: evidências, limites e interações","ginseng-vitalidade-interacoes","ginseng","raiz de ginseng e água","fadiga e adaptação ao estresse","Ginseng pode alterar glicemia, sono, coagulação e efeito de medicamentos. Não use sem orientação se houver doença crônica."],
  ["pele-beleza","Hibisco para inchaço e pele: o que a bebida realmente oferece","hibisco-inchaco-pele","hibisco","flores secas de hibisco e água","hidratação, retenção leve e ingestão de compostos vegetais","Pode reduzir a pressão e interagir com remédios. Gestantes e pessoas com pressão baixa devem buscar orientação."],
  ["pele-beleza","Cavalinha fortalece cabelo e unhas? Entenda a relação com silício","cavalinha-cabelo-unhas-silicio","cavalinha","cavalinha seca e água","cuidados com cabelo, unhas e retenção leve","Uso prolongado pode alterar eletrólitos e vitamina B1. Evite em doença renal, gestação e junto a diuréticos sem orientação."],
  ["pele-beleza","Calêndula na pele: quando o uso externo exige cuidado","calendula-pele-irritacao-cuidados","calêndula","flores secas de calêndula e água","irritações leves e cuidado tópico tradicional","Não aplique em feridas profundas ou infectadas. Pessoas alérgicas à família Asteraceae devem ter cautela."],
  ["pele-beleza","Centelha-asiática e celulite: expectativas realistas","centelha-asiatica-celulite-circulacao","centelha-asiática","folhas secas de centelha-asiática e água","aparência da pele e circulação","Celulite é comum e não há chá que a elimine. A planta pode interagir com sedativos e medicamentos hepáticos."],
  ["pele-beleza","Tansagem para garganta e pele: uso tradicional e sinais de alerta","tansagem-garganta-pele","tansagem","folhas de tansagem e água","irritação leve de garganta e pele","Falta de ar, dificuldade para engolir, febre alta ou lesão de pele com pus pedem avaliação."],
  ["pele-beleza","Casca de cebola no chá: quercetina, aproveitamento e limites","casca-de-cebola-quercetina","casca de cebola","casca bem lavada de cebola e água","aproveitamento integral e compostos antioxidantes","Use apenas cascas íntegras e higienizadas. Antioxidante não significa prevenção ou cura garantida de doenças."],
  ["circulacao","Pressão alta e chá de sete-sangrias: por que não substituir remédios","pressao-alta-sete-sangrias","sete-sangrias","folhas e flores secas de sete-sangrias e água","uso tradicional relacionado à circulação","Hipertensão costuma não dar sintomas. Não suspenda remédios; tontura, dor no peito, falta de ar ou pressão muito elevada exigem atendimento."],
  ["circulacao","Ginkgo biloba para memória: atenção ao risco de sangramento","ginkgo-biloba-memoria-risco","ginkgo biloba","folhas secas de ginkgo biloba e água","circulação e queixas de memória","Pode aumentar risco de sangramento e interagir com anticoagulantes, antiagregantes e anticonvulsivantes. Cirurgias exigem aviso médico."],
  ["circulacao","Ansiedade e palpitação: onde a passiflora pode entrar","passiflora-ansiedade-palpitacao","passiflora","folhas e flores secas de passiflora e água","relaxamento e tensão leve","Palpitação com dor no peito, desmaio ou falta de ar é urgência. Passiflora pode aumentar sonolência e interagir com sedativos."],
  ["circulacao","Folha de amora na menopausa: o que se sabe sobre ondas de calor","folha-de-amora-menopausa","folha de amora","folhas secas de amora e água","ondas de calor e bem-estar na menopausa","Sangramento após a menopausa exige avaliação. Pessoas com condições sensíveis a hormônios devem consultar um profissional."],
  ["circulacao","Canela baixa açúcar no sangue? Limites e segurança","canela-glicemia-diabetes","canela","canela em pau ou em pó e água","sabor, alimentação e interesse em glicemia","Canela não substitui antidiabéticos. Excesso de cássia pode expor a cumarina; hipoglicemia é um risco com combinações inadequadas."],
  ["sono-estresse","Chá de camomila antes de dormir: como criar um ritual de sono","camomila-sono-relaxamento","camomila","flores secas de camomila e água","relaxamento e rotina noturna","Pode causar alergia, especialmente em pessoas sensíveis à família Asteraceae, e aumentar efeito de sedativos."],
  ["sono-estresse","Mulungu para ansiedade e insônia: por que exige cautela","mulungu-ansiedade-insonia-cautela","mulungu","casca seca de mulungu e água","uso tradicional como calmante","Pode causar sedação e queda de pressão. Não combine com álcool, sedativos ou direção; gestantes e lactantes devem evitar."],
  ["sono-estresse","Valeriana para dormir: uso responsável e interações","valeriana-insonia-interacoes","valeriana","raiz seca de valeriana e água","dificuldade ocasional para iniciar o sono","Pode causar sonolência e interagir com álcool e sedativos. Insônia persistente precisa de investigação."],
  ["sono-estresse","Melissa para estresse leve: uma pausa que não substitui cuidado","melissa-estresse-leve","melissa","folhas de melissa e água","tensão leve e rotina de relaxamento","Sintomas intensos de ansiedade ou depressão exigem ajuda profissional. Pode somar efeito a medicamentos sedativos."],
  ["sono-estresse","Chá de casca de maçã: conforto e aproveitamento integral","casca-de-maca-sono-antioxidantes","casca de maçã","casca bem lavada de maçã, água e canela opcional","uma bebida sem cafeína para o período noturno","Higienize bem a fruta. A bebida pode compor o ritual, mas não é tratamento comprovado para insônia."],
  ["sono-estresse","Manjericão para estresse e resfriado: o que esperar","manjericao-estresse-resfriado","manjericão","folhas frescas de manjericão e água","conforto, aroma e hidratação","Falta de ar, febre persistente ou piora respiratória precisam de avaliação. O chá não trata infecções."],
  ["imunidade-respiracao","Alho com mel para gripe: conforto não é cura","alho-mel-gripe-resfriado","alho, mel e limão","alho, mel, limão e água","conforto da garganta e hidratação durante resfriados","Mel é proibido para menores de 1 ano. Falta de ar, confusão, desidratação ou febre persistente exigem atendimento; alho pode aumentar sangramento."],
  ["imunidade-respiracao","Camu-camu e vitamina C: mais nem sempre é melhor","camu-camu-vitamina-c-imunidade","camu-camu","pó de camu-camu e água","ingestão de vitamina C dentro de uma alimentação variada","Vitamina C não impede todas as infecções; excesso pode causar diarreia e aumentar risco de cálculos em pessoas predispostas."],
  ["imunidade-respiracao","Poejo para tosse: riscos que você precisa conhecer","poejo-tosse-riscos","poejo","folhas de poejo e água","uso tradicional para conforto respiratório","Poejo pode ser tóxico, especialmente em óleo concentrado, e deve ser evitado na gestação e em crianças. Tosse com falta de ar ou sangue é sinal de alerta."],
  ["imunidade-respiracao","Romã para dor de garganta: gargarejo, hidratação e limites","roma-dor-de-garganta","casca de romã","casca higienizada de romã e água","conforto local da garganta","Dificuldade para respirar ou engolir, salivação excessiva, desidratação ou sintomas persistentes pedem atendimento."],
  ["imunidade-respiracao","Orégano para cólica: o que o uso culinário pode oferecer","oregano-colica-cuidados","orégano","orégano seco e água","conforto digestivo e menstrual leve","Dor pélvica forte, gravidez possível, sangramento anormal ou febre exigem avaliação. Chá não é tratamento antifúngico."],
  ["imunidade-respiracao","Mastruz para pulmões e vermes? Leia antes de usar","mastruz-pulmoes-vermes-riscos","mastruz","folhas de mastruz e água","um uso popular transmitido entre gerações","Mastruz pode ser tóxico e não deve ser usado por gestantes, lactantes ou crianças sem orientação. Verminose e sintomas pulmonares exigem diagnóstico."],
  ["imunidade-respiracao","Ipê-roxo e imunidade: tradição não é prova de tratamento","ipe-roxo-imunidade-evidencias","ipê-roxo","casca seca de ipê-roxo e água","o uso tradicional da casca","Pode causar náusea e alterar coagulação. Não use como tratamento de câncer, infecção ou doença autoimune."],
  ["ossos-articulacoes","Unha-de-gato para dor articular: evidências e contraindicações","unha-de-gato-dor-articular","unha-de-gato","casca seca de unha-de-gato e água","desconforto articular e interesse em plantas tradicionais","Pode interagir com imunossupressores, anticoagulantes e remédios de pressão; gestantes e pessoas com doenças autoimunes precisam de orientação."],
  ["ossos-articulacoes","Arnica para hematomas: somente uso externo e pele íntegra","arnica-hematomas-uso-externo","arnica","flores secas de arnica e água para compressa","hematomas e desconforto muscular leve","Arnica não deve ser ingerida e não deve ser aplicada em feridas abertas. Dor forte, deformidade ou limitação importante precisa de avaliação."],
  ["cuidados-essenciais","Dor de dente e cravo-da-índia: alívio temporário não trata a causa","cravo-da-india-dor-de-dente","cravo-da-índia","cravos-da-índia e água","conforto temporário na boca","Dor de dente exige dentista. Inchaço no rosto, febre ou dificuldade para engolir pode indicar infecção urgente; óleo concentrado pode queimar a mucosa."],
  ["cuidados-essenciais","Semente de abóbora e próstata: alimentação e sinais de alerta","semente-de-abobora-prostata","semente de abóbora","sementes de abóbora sem sal e água","alimentação e saúde urinária masculina","Dificuldade para urinar, sangue na urina ou dor precisa de avaliação. A bebida não previne nem trata câncer de próstata."],
  ["cuidados-essenciais","Carqueja para diabetes e fígado: cuidado com a glicemia","carqueja-diabetes-figado","carqueja","folhas secas de carqueja e água","uso digestivo tradicional","Pode reduzir glicemia e pressão e interagir com medicamentos. Não substitua tratamento do diabetes ou doença hepática."],
  ["cuidados-essenciais","Sálvia na menopausa: ondas de calor e suor noturno","salvia-menopausa-suor-noturno","sálvia","folhas de sálvia e água","conforto durante ondas de calor","Uso excessivo pode expor à tujona. Evite na gestação, amamentação e em pessoas com histórico de convulsões sem orientação."],
  ["cuidados-essenciais","Pata-de-vaca e diabetes: por que monitorar é essencial","pata-de-vaca-diabetes","pata-de-vaca","folhas secas de pata-de-vaca e água","interesse tradicional em controle glicêmico","Pode somar efeito aos antidiabéticos e causar hipoglicemia. Nunca ajuste insulina ou comprimidos por conta própria."],
  ["cuidados-essenciais","Infecção urinária e uva-ursi: não adie o diagnóstico","uva-ursi-infeccao-urinaria","uva-ursi","folhas secas de uva-ursi e água","uso tradicional urinário","Febre, dor lombar, sangue na urina, gravidez ou sintomas em homens exigem atendimento. Uva-ursi não é para uso prolongado e pode afetar fígado e estômago."],
  ["cuidados-essenciais","Barbatimão e saúde íntima: riscos de duchas e automedicação","barbatimao-saude-intima-cicatrizacao","barbatimão","casca seca de barbatimão e água para uso externo","uso externo tradicional na pele","Não faça ducha vaginal nem aplique em mucosa ou ferida sem orientação. Corrimento, odor, dor ou sangramento precisam de diagnóstico."],
  ["cuidados-essenciais","Malva para boca e garganta: conforto e sinais de alerta","malva-boca-garganta","malva","folhas e flores secas de malva e água","irritação leve de boca e garganta","Lesões por mais de duas semanas, dificuldade para engolir, febre ou perda de peso precisam de avaliação."],
  ["cuidados-essenciais","Casca de laranja no chá: aroma, digestão e aproveitamento","casca-de-laranja-digestao","casca de laranja","casca bem lavada de laranja, água e mel opcional","aroma, hidratação e aproveitamento integral","Higienize bem e evite cascas mofadas. Refluxo pode piorar com cítricos; a bebida não substitui uma alimentação variada."]
];

const intros = {
  "digestivo": "Sintomas digestivos são comuns, mas podem ter causas diferentes: alimentação, ritmo das refeições, estresse, intolerâncias e doenças que precisam de diagnóstico.",
  "figado-rins": "Fígado e rins já possuem sistemas próprios de processamento e eliminação. Bebidas podem fazer parte da rotina, mas não devem ser apresentadas como uma limpeza milagrosa.",
  "energia-foco": "Energia e concentração dependem principalmente de sono, alimentação, hidratação, movimento e saúde geral. Uma bebida pode complementar a rotina, não corrigir sozinha a causa do cansaço.",
  "pele-beleza": "Pele, cabelo e unhas refletem genética, nutrição, hormônios, ambiente e cuidados cotidianos. Resultados realistas começam por entender esses fatores.",
  "circulacao": "Alterações de pressão, glicemia, palpitações e circulação merecem atenção porque muitas vezes não podem ser avaliadas apenas pelos sintomas.",
  "sono-estresse": "Uma rotina previsível, menos luz à noite, horários regulares e redução de estimulantes costumam ter mais impacto no sono do que qualquer ingrediente isolado.",
  "imunidade-respiracao": "Resfriados geralmente melhoram com o tempo, descanso e hidratação, mas sinais de gravidade não devem ser tratados apenas com preparos caseiros.",
  "ossos-articulacoes": "Dor e inflamação podem ter origem muscular, articular, traumática ou sistêmica. Saber a causa é mais importante do que apenas diminuir o desconforto.",
  "cuidados-essenciais": "Receitas tradicionais fazem parte da cultura popular, porém sintomas persistentes ou intensos precisam de diagnóstico e tratamento adequados."
};

function esc(value) { return String(value).replaceAll("'", "''"); }
function html(post) {
  const [cat,title,slug,ingredient,items,context,warning] = post;
  return `<p class="answer-box"><strong>Resposta direta:</strong> ${title.replace(/:.*$/, "")} pede atenção à causa, aos hábitos e aos sinais de alerta. O <strong>${ingredient}</strong> aparece em preparos tradicionais, mas não substitui diagnóstico, medicamentos ou acompanhamento profissional.</p>
<h2>Por que esse problema acontece?</h2>
<p>${intros[cat]} Neste artigo, o foco é ${context}. Observe quando começou, a frequência, o que piora ou melhora e se existem outros sintomas. Esse registro simples ajuda a tomar decisões melhores e a conversar com um profissional.</p>
<h2>O ingrediente tradicional desta pauta</h2>
<p>O preparo associado a este tema usa <strong>${items}</strong>. O interesse pelo ${ingredient} vem do uso culinário ou popular e de seus compostos naturais. Isso não significa que todas as alegações tradicionais estejam comprovadas, nem que uma concentração caseira tenha o mesmo efeito de um produto estudado.</p>
<p>A escolha da planta correta, a procedência, a higiene, a quantidade e as interações importam. “Natural” descreve a origem; não é sinônimo de “sem risco”.</p>
<h2>O que fazer antes de procurar uma solução rápida</h2>
<ul><li>Priorize água, alimentação variada, sono e rotina compatíveis com o seu caso.</li><li>Evite misturar várias plantas ou suplementos ao mesmo tempo.</li><li>Confira possíveis interações se usa medicamentos, está grávida, amamenta ou convive com doença crônica.</li><li>Procure atendimento quando o sintoma é forte, novo, recorrente ou está piorando.</li></ul>
<aside class="health-alert"><strong>Atenção:</strong> ${warning}</aside>
<h2>Onde encontrar o preparo completo</h2>
<p>O <strong>Livro de Remédios Antigos de Vovó Tereza</strong> reúne 55 receitas tradicionais de chás e bebidas, organizadas por objetivo de bem-estar. A receita relacionada a ${context} apresenta ingredientes, modo de preparo, observações e contraindicações em um só lugar.</p>
<p><a class="article-cta" href="/receitas">Conheça as 55 receitas do livro da Vovó Tereza</a></p>
<h2>Perguntas frequentes</h2>
<h3>${ingredient} resolve esse problema?</h3><p>Não é correto prometer isso. Ele pode integrar uma rotina de autocuidado em situações leves, desde que seja apropriado para a pessoa, mas a causa do sintoma determina o cuidado necessário.</p>
<h3>Posso combinar com remédios?</h3><p>Não presuma que sim. Plantas e alimentos concentrados podem mudar o efeito de medicamentos. Confirme com médico ou farmacêutico.</p>
<h3>Quando devo buscar atendimento?</h3><p>Quando houver intensidade importante, piora, repetição, sinais de alerta ou qualquer dúvida sobre diagnóstico. Em emergência, procure atendimento imediato.</p>
<hr><p class="article-sources"><strong>Revisão editorial:</strong> conteúdo educativo baseado no tema tradicional do e-book e revisado para não substituir cuidado profissional. Consulte também o <a href="https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/fitoterapicos" rel="nofollow noopener">portal de fitoterápicos da Anvisa</a> e a <a href="https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z" rel="nofollow noopener">biblioteca Saúde de A a Z do Ministério da Saúde</a>.</p>`;
}

const categorySql = categories.map(([slug,name,parent],i) => `('${esc(name)}','${slug}',${i+1})`).join(",\n  ");
const postSql = posts.map((post,i) => {
  const [cat,title,slug,ingredient,,context] = post;
  const excerpt = `${title}. Entenda o contexto, os cuidados com ${ingredient}, sinais de alerta e onde encontrar o preparo tradicional completo.`;
  const description = `${title}. Veja cuidados, contraindicações e sinais de alerta antes de usar ${ingredient}. Conteúdo educativo da Vovó Tereza.`.slice(0,158);
  const published = new Date(Date.UTC(2026,6,22,12,0,i)).toISOString();
  return `('${esc(title)}','${slug}','${esc(excerpt)}','${esc(html(post))}',(select id from public.blog_categories where slug='${cat}'),'published','','','${published}','${esc(title.slice(0,60))}','${esc(description)}','${esc(ingredient + ", " + context + ", chá, cuidados, contraindicações")}')`;
}).join(",\n  ");

const sql = `-- Conteúdo editorial do e-book Vovó Tereza. Execute após blog-migration.sql.
begin;
alter table public.blog_posts add column if not exists meta_title text not null default '';
alter table public.blog_posts add column if not exists meta_description text not null default '';
alter table public.blog_posts add column if not exists focus_keywords text not null default '';
alter table public.blog_posts add column if not exists author_name text not null default 'Equipe Vovó Tereza';
alter table public.blog_posts add column if not exists reviewed_at timestamptz;

insert into public.blog_categories(name,slug,sort_order)
values
  ${categorySql}
on conflict(slug) do update set name=excluded.name,sort_order=excluded.sort_order,active=true,updated_at=now();

insert into public.blog_posts(title,slug,excerpt,content,category_id,status,desktop_image_url,mobile_image_url,published_at,meta_title,meta_description,focus_keywords)
values
  ${postSql}
on conflict(slug) do update set title=excluded.title,excerpt=excluded.excerpt,content=excluded.content,category_id=excluded.category_id,status=excluded.status,meta_title=excluded.meta_title,meta_description=excluded.meta_description,focus_keywords=excluded.focus_keywords,updated_at=now();
commit;
`;

const baseUrls = ["/","/sobre","/contato","/privacidade","/termos","/receitas"];
const urls = baseUrls.concat(posts.map(([, ,slug]) => `/artigos/${slug}`));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url,i) => `  <url><loc>${domain}${url}</loc><changefreq>${i === 0 ? "daily" : i < 6 ? "monthly" : "yearly"}</changefreq><priority>${i === 0 ? "1.0" : i < 6 ? "0.6" : "0.7"}</priority></url>`).join("\n")}\n</urlset>\n`;

fs.writeFileSync(path.join(root,"blog-content-migration.sql"),sql,"utf8");
fs.writeFileSync(path.join(root,"sitemap.xml"),sitemap,"utf8");
console.log(`Gerados ${posts.length} posts, ${categories.length} categorias e ${urls.length} URLs.`);

export { categories, posts, html };
