let dadosLicaoGlobal = null;

async function buscarLicao() {

    try {

        document.getElementById("titulo-trimestre").innerText =
            "Carregando lição...";

        // Busca todos os trimestres disponíveis
        const quarterlies = await fetch(
            "https://sabbath-school.adventech.io/api/v2/pt/quarterlies/index.json"
        ).then(r => r.json());

        const hoje = new Date();

        // Encontra o trimestre atual
        const trimestreAtual = quarterlies.find(trimestre => {

            const [di, mi, ai] =
                trimestre.start_date.split("/");

            const [df, mf, af] =
                trimestre.end_date.split("/");

            const inicio =
                new Date(ai, mi - 1, di);

            const fim =
                new Date(af, mf - 1, df, 23, 59, 59);

            return hoje >= inicio && hoje <= fim;
        });

        if (!trimestreAtual) {
            throw new Error("Nenhum trimestre encontrado.");
        }

        // Carrega o trimestre encontrado
        const dadosTrimestre = await fetch(
            `${trimestreAtual.full_path}/index.json`
        ).then(r => r.json());

        document.getElementById("titulo-trimestre").innerText =
            trimestreAtual.title;

        document.getElementById("data-trimestre").innerText =
            trimestreAtual.human_date;

        // Descobre a lição da semana atual
        const licaoAtual = dadosTrimestre.lessons.find(licao => {

            const [di, mi, ai] =
                licao.start_date.split("/");

            const [df, mf, af] =
                licao.end_date.split("/");

            const inicio =
                new Date(ai, mi - 1, di);

            const fim =
                new Date(af, mf - 1, df, 23, 59, 59);

            return hoje >= inicio && hoje <= fim;
        });

        if (!licaoAtual) {
            throw new Error("Lição da semana não encontrada.");
        }

        // Carrega os dias da lição
  dadosLicaoGlobal = await fetch(
    `${licaoAtual.full_path}/index.json`
).then(r => r.json());

const capa = document.getElementById("capa-licao");

if (capa && licaoAtual.cover) {
    capa.src = licaoAtual.cover;
}

mudarDia(0);

    } catch (erro) {

        console.error(erro);

        document.getElementById("titulo-trimestre").innerText =
            "Erro ao carregar";

        document.getElementById("texto-do-dia").innerHTML =
            `
            <p>
                Não foi possível carregar a lição.
            </p>
            <p>
                ${erro.message}
            </p>
            `;
    }
}
window.onload = buscarLicao;

function mudarDia(indice) {

    if (!dadosLicaoGlobal || !dadosLicaoGlobal.days) return;

    const diasNomes = [
        "Sábado",
        "Domingo",
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta"
    ];

   const dia = dadosLicaoGlobal.days[indice];

if (!dia) {
    document.getElementById("texto-do-dia").innerHTML =
        "<p>Dia não disponível.</p>";
    return;
}
   document.getElementById("titulo-do-dia").innerHTML =
    `
    <span class="data-dia">${formatarData(dia.date)}</span>
    ${diasNomes[indice]} - ${dia.title}
    `;

    document.getElementById("texto-do-dia").innerHTML =
        "<p>Carregando lição...</p>";

   fetch(`${dia.full_read_path}/index.json`)
    .then(r => {
        if (!r.ok) {
            throw new Error("Erro ao carregar leitura.");
        }
        return r.json();
    })
       .then(dados => {

    const conteudo =
        dados.content || "<p>Conteúdo indisponível.</p>";

    const respostaSalva =
        localStorage.getItem(
            `resposta_${dadosLicaoGlobal.lesson.id}_${indice}`
        ) || "";

    document.getElementById("texto-do-dia").innerHTML =
        `
        ${conteudo}

        <div class="area-resposta" style="margin-top:20px;">
            <textarea
                id="resposta-${indice}"
                placeholder="Escreva sua resposta aqui..."
            >${respostaSalva}</textarea>

            <br><br>

            <button onclick="salvarResposta(${indice})">
                Salvar Resposta
            </button>
        </div>
        `;
})
        .catch(() => {

            document.getElementById("texto-do-dia").innerHTML =
                "<p>Erro ao carregar o conteúdo da lição.</p>";
        });

    document
        .querySelectorAll(".btn-dia")
        .forEach(btn => btn.classList.remove("ativo"));

    document
        .querySelectorAll(".btn-dia")
        [indice]
        ?.classList.add("ativo");
}

function mostrarDataHoje() {

    const hoje = new Date();

    const opcoes = {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    };

    const dataFormatada =
        hoje.toLocaleDateString("pt-BR", opcoes);

    document.getElementById("data-hoje").innerText =
        dataFormatada;
}

window.onload = () => {
    mostrarDataHoje();
    buscarLicao();
};

function formatarData(dataStr) {

    const [dia, mes, ano] = dataStr.split("/");

    const meses = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ];

    return `${dia} de ${meses[mes - 1]} de ${ano}`;
}

function salvarResposta(indice) {

    const campo =
        document.getElementById(`resposta-${indice}`);

    if (!campo) return;

    localStorage.setItem(
        `resposta_${dadosLicaoGlobal.lesson.id}_${indice}`,
        campo.value
    );

    const mensagem = document.createElement("div");

    mensagem.className = "mensagem-sucesso";
    mensagem.innerText = "✅ Resposta salva com sucesso!";

    campo.parentElement.appendChild(mensagem);

    setTimeout(() => {
        mensagem.remove();
    }, 3000);
}