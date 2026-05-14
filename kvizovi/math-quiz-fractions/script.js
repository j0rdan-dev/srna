const DENOMINATORS = [2, 5, 10, 100];
const DECIMAL_DENOMINATORS = [2, 5, 10, 100];
const VISUAL_TYPES = ["square", "pie"];
const PIE_MAX_DENOMINATOR = 10;
const questionCard = document.querySelector(".question-card");

function nextQuestion() {
    progress.style.width = "100%";
    timed();
    fScore.innerHTML = score.innerHTML;

    if (qNo.innerText === "10") {
        whenFinished();
        return;
    }

    const mode = Math.floor(Math.random() * 3);

    if (mode === 0) {
        generateFractionToFractionQuestion();
    } else if (mode === 1) {
        generateFractionToDecimalQuestion();
    } else {
        generateComparisonQuestion();
    }

    getQNo();
}

function generateFractionToFractionQuestion() {
    const visualType = pickVisualType();
    const allowedDenominators = getAllowedDenominators(visualType, "fraction");
    const f = createRandomFraction(allowedDenominators);
    const correct = formatFraction(f);
    answer = correct;
    setQuestionTheme("fraction");

    question.innerHTML = `
        <div class="fq-title tiny-prompt">Која дропка ја прикажува сликата?</div>
        ${renderSingleFraction(f, "", visualType)}
    `;

    const options = new Set([correct]);
    while (options.size < 4) {
        const wrong = createRandomFraction(allowedDenominators);
        const wrongLabel = formatFraction(wrong);
        if (wrongLabel !== correct && Math.abs(f.value - wrong.value) > 0.0001) {
            options.add(wrongLabel);
        }
    }

    assignOptions([...options], correct);
}

function generateFractionToDecimalQuestion() {
    const visualType = pickVisualType();
    const allowedDenominators = getAllowedDenominators(visualType, "decimal");
    const f = createRandomFraction(allowedDenominators);
    const correct = formatDecimal(f.value);
    answer = correct;
    setQuestionTheme("decimal");

    question.innerHTML = `
        <div class="fq-title decimal-prompt">Кој децимален број одговара на дропката?</div>
        ${renderSingleFraction(f, "", visualType)}
    `;

    const options = new Set([correct]);
    while (options.size < 4) {
        const offset = randomRange(0.04, 0.35) * (Math.random() < 0.5 ? -1 : 1);
        let wrongValue = clamp(f.value + offset, 0.01, 0.99);
        const wrong = formatDecimal(wrongValue);
        if (wrong !== correct) {
            options.add(wrong);
        }
    }

    assignOptions([...options], correct);
}

function generateComparisonQuestion() {
    let left;
    let right;
    let correctSign;
    const visualType = pickVisualType();
    const allowedDenominators = getAllowedDenominators(visualType, "comparison");
    setQuestionTheme("compare");

    const comparisonType = Math.floor(Math.random() * 3);

    if (comparisonType === 0) {
        // Equal fractions represented differently.
        left = createRandomFraction(allowedDenominators);
        right = createEquivalentFraction(left, allowedDenominators);
        correctSign = "=";
    } else {
        left = createRandomFraction(allowedDenominators);
        right = createRandomFraction(allowedDenominators);

        let guard = 0;
        while (Math.abs(left.value - right.value) < 0.03 && guard < 100) {
            right = createRandomFraction(allowedDenominators);
            guard += 1;
        }

        correctSign = left.value > right.value ? ">" : "<";
    }

    answer = correctSign;

    question.innerHTML = `
        <div class="fq-title tiny-prompt">Одбери го точниот знак меѓу двете дропки</div>
        <div class="fraction-wrap">
            ${renderFractionCard(left, "", visualType)}
            <div class="comparison-sign-box" aria-hidden="true">?</div>
            ${renderFractionCard(right, "", visualType)}
        </div>
    `;

    const options = [">", "<", "=", "≠"];
    assignOptions(options, correctSign);
}

function createRandomFraction(allowedDenominators = DENOMINATORS) {
    const denominator = allowedDenominators[Math.floor(Math.random() * allowedDenominators.length)];
    const numerator = Math.floor(Math.random() * (denominator - 1)) + 1;
    return {
        numerator,
        denominator,
        value: numerator / denominator
    };
}

function pickVisualType() {
    return VISUAL_TYPES[Math.floor(Math.random() * VISUAL_TYPES.length)];
}

function getAllowedDenominators(visualType, mode) {
    if (mode === "decimal") {
        const decimalSet = visualType === "pie"
            ? DECIMAL_DENOMINATORS.filter((d) => d <= PIE_MAX_DENOMINATOR)
            : DECIMAL_DENOMINATORS;
        return decimalSet;
    }

    if (visualType === "pie") {
        return DENOMINATORS.filter((d) => d <= PIE_MAX_DENOMINATOR);
    }

    return DENOMINATORS;
}

function createEquivalentFraction(baseFraction, allowedDenominators) {
    const candidates = allowedDenominators.filter((d) => d >= baseFraction.denominator && d % baseFraction.denominator === 0);
    const targetDenominator = candidates[Math.floor(Math.random() * candidates.length)] || baseFraction.denominator;
    const factor = targetDenominator / baseFraction.denominator;

    return {
        numerator: baseFraction.numerator * factor,
        denominator: targetDenominator,
        value: baseFraction.value
    };
}

function setQuestionTheme(mode) {
    questionCard.classList.remove("mode-fraction", "mode-decimal", "mode-compare");
    questionCard.classList.add(`mode-${mode}`);
}

function getGridDimensions(parts) {
    let rows = Math.floor(Math.sqrt(parts));
    while (rows > 1 && parts % rows !== 0) {
        rows -= 1;
    }
    const cols = parts / rows;
    return { rows, cols };
}

function renderSingleFraction(fraction, label, visualType) {
    return `<div class="fraction-wrap">${renderFractionCard(fraction, label, visualType)}</div>`;
}

function renderFractionCard(fraction, label, visualType) {
    return `
        <div class="fraction-block">
            ${label ? `<div class="fraction-label">${label}</div>` : ""}
            ${renderVisual(fraction, visualType)}
        </div>
    `;
}

function renderVisual(fraction, visualType) {
    if (visualType === "pie") {
        const fillAngle = (fraction.numerator / fraction.denominator) * 360;
        return `<div class="fraction-pie" style="--parts:${fraction.denominator}; --fill:${fillAngle}deg;"></div>`;
    }

    const dims = getGridDimensions(fraction.denominator);
    return `
        <div class="fraction-grid" style="grid-template-columns: repeat(${dims.cols}, 1fr);">
            ${renderCells(fraction.numerator, fraction.denominator)}
        </div>
    `;
}

function renderCells(filled, total) {
    let cells = "";
    for (let i = 0; i < total; i += 1) {
        const filledClass = i < filled ? " filled" : "";
        cells += `<div class="fraction-cell${filledClass}"></div>`;
    }
    return cells;
}

function formatFraction(fraction) {
    return `${fraction.numerator}/${fraction.denominator}`;
}

function formatDecimal(value) {
    return (Math.round(value * 100) / 100).toFixed(2);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function assignOptions(options, correctOption) {
    const shuffled = shuffle(options.slice());

    for (let i = 0; i < buttons.length; i += 1) {
        buttons[i].textContent = shuffled[i];
    }

    answer = correctOption;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
