document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-business');
  const nextButton = modal?.querySelector('.next-button');
  const companyInput = modal?.querySelector('.company-name-input');
  const bizNumberInput = modal?.querySelector('.business-number-input');
  const inputs = [
    companyInput,
    bizNumberInput,
    modal?.querySelector('.ceo-name-input'),
    modal?.querySelector('#postcode'),
    modal?.querySelector('#addr-main'),
    modal?.querySelector('#addr-detail'),
    modal?.querySelector('#business-type'),
  ].filter(Boolean);

  if (!nextButton || inputs.length === 0) return;

  const searchButton = modal.querySelector('#addr-search-btn');
  if (searchButton) {
    searchButton.style.display = 'none';
  }

  const textOverrides = {
    postcode: '국가 또는 리전',
    'addr-main': '주소 라인 1',
    'addr-detail': '주소 라인 2',
  };

  Object.entries(textOverrides).forEach(([id, text]) => {
    const input = modal.querySelector(`#${id}`);
    if (!input) return;
    input.readOnly = false;
    const label = input.closest('.name-placeholder, .phone-placeholder');
    const labelText = label?.querySelector('.name-text-in, .phone-text-in');
    if (labelText) labelText.textContent = text;
  });

  const shrink = (label) => {
    if (!label) return;
    label.style.fontSize = '12px';
    label.style.paddingTop = '8px';
    label.style.color = 'rgb(29, 155, 240)';
  };

  const expand = (label) => {
    if (!label) return;
    label.style.fontSize = '17px';
    label.style.paddingTop = '16px';
    label.style.color = 'rgb(83, 100, 113)';
  };

  const setFocus = (box) => {
    if (!box) return;
    box.style.borderColor = 'rgb(29, 155, 240)';
    box.style.borderWidth = '2px';
  };

  const setNeutral = (box) => {
    if (!box) return;
    box.style.borderColor = 'rgb(207, 217, 222)';
    box.style.borderWidth = '1px';
  };

  // ── 사업자 등록번호 자동 포맷 (XXX-XX-XXXXX) ─────────────────────────
  // 숫자만 추출 후 10자리 안에서 3-2-5 패턴으로 하이픈을 끼워넣는다.
  const formatBusinessNumber = (raw) => {
    const digits = String(raw || '').replace(/\D/g, '').slice(0, 10);
    if (digits.length < 4) return digits;
    if (digits.length < 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  };

  if (bizNumberInput) {
    bizNumberInput.setAttribute('inputmode', 'numeric');
    bizNumberInput.setAttribute('maxlength', '12'); // 10 digits + 2 hyphens
    bizNumberInput.setAttribute('placeholder', 'XXX-XX-XXXXX');
    bizNumberInput.value = formatBusinessNumber(bizNumberInput.value);
    bizNumberInput.addEventListener('input', () => {
      bizNumberInput.value = formatBusinessNumber(bizNumberInput.value);
    });
  }

  // ── 한글/영문(공백 허용)만 입력 허용 ───────────────────────────────────
  // 대표자명, 국가/리전, 업무형태 입력은 숫자/특수문자가 들어갈 이유가 없어
  // 입력 즉시 한글·영문·공백 외 문자를 떨어뜨린다. 한글 조합 중인 자모는
  // 사용자가 합치는 도중이므로 통과시킨다.
  const KOREAN_ENGLISH_REGEX = /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\s]/g;
  const enforceKoreanEnglish = (input) => {
    if (!input) return;
    const sanitize = () => {
      const cleaned = input.value.replace(KOREAN_ENGLISH_REGEX, '');
      if (cleaned !== input.value) input.value = cleaned;
    };
    input.value = input.value.replace(KOREAN_ENGLISH_REGEX, '');
    input.addEventListener('input', sanitize);
  };
  enforceKoreanEnglish(modal.querySelector('.company-name-input'));
  enforceKoreanEnglish(modal.querySelector('.ceo-name-input'));
  enforceKoreanEnglish(modal.querySelector('#postcode'));
  enforceKoreanEnglish(modal.querySelector('#business-type'));

  // ── 중복 검사 메시지 노드 ─────────────────────────────────────────────
  const ensureMessageNode = (input) => {
    if (!input) return null;
    const wrap = input.closest('.name-placeholder-wrap, .phone-number-placeholder');
    if (!wrap) return null;
    let node = wrap.querySelector('.field-error-message');
    if (!node) {
      node = document.createElement('div');
      node.className = 'field-error-message';
      wrap.appendChild(node);
    }
    return node;
  };

  const renderMessage = (node, message = '', type = 'error') => {
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('show', !!message);
    node.style.color = type === 'success' ? 'rgb(29, 155, 240)' : 'rgb(217, 119, 6)';
  };

  const companyMessage = ensureMessageNode(companyInput);
  const bizNumberMessage = ensureMessageNode(bizNumberInput);

  let companyAvailable = null; // null: 미검사, true: 사용가능, false: 중복
  let bizNumberAvailable = null;

  const isBizNumberFormatValid = (value) => /^\d{3}-\d{2}-\d{5}$/.test(value.trim());

  const checkCompanyDuplicate = async () => {
    if (!companyInput) return;
    const value = companyInput.value.trim();
    if (!value) {
      companyAvailable = null;
      renderMessage(companyMessage, '');
      return;
    }
    try {
      const isAvailable = await joinService.checkCompanyName(value);
      if (companyInput.value.trim() !== value) return;
      companyAvailable = isAvailable;
      renderMessage(
        companyMessage,
        isAvailable ? '사용 가능한 업체명입니다.' : '이미 등록된 업체명입니다.',
        isAvailable ? 'success' : 'error'
      );
    } catch (error) {
      companyAvailable = null;
      renderMessage(companyMessage, '중복 확인 중 오류가 발생했습니다.');
    } finally {
      syncNextButton();
    }
  };

  const checkBizNumberDuplicate = async () => {
    if (!bizNumberInput) return;
    const value = bizNumberInput.value.trim();
    if (!value) {
      bizNumberAvailable = null;
      renderMessage(bizNumberMessage, '');
      return;
    }
    if (!isBizNumberFormatValid(value)) {
      bizNumberAvailable = false;
      renderMessage(bizNumberMessage, '사업자 등록번호 10자리를 입력하세요.');
      return;
    }
    try {
      const isAvailable = await joinService.checkBusinessNumber(value);
      if (bizNumberInput.value.trim() !== value) return;
      bizNumberAvailable = isAvailable;
      renderMessage(
        bizNumberMessage,
        isAvailable ? '사용 가능한 사업자 등록번호입니다.' : '이미 등록된 사업자 등록번호입니다.',
        isAvailable ? 'success' : 'error'
      );
    } catch (error) {
      bizNumberAvailable = null;
      renderMessage(bizNumberMessage, '중복 확인 중 오류가 발생했습니다.');
    } finally {
      syncNextButton();
    }
  };

  const syncNextButton = () => {
    const allFilled = inputs.every((input) => input.value.trim().length > 0);
    const duplicatesPassed =
      (companyInput ? companyAvailable === true : true) &&
      (bizNumberInput ? bizNumberAvailable === true : true);
    const enabled = allFilled && duplicatesPassed;
    nextButton.disabled = !enabled;
    nextButton.style.backgroundColor = 'rgb(15, 20, 25)';
    nextButton.style.opacity = enabled ? '1' : '0.5';
    nextButton.style.cursor = enabled ? 'pointer' : 'default';
  };

  inputs.forEach((input) => {
    const labelBox = input.closest('.name-placeholder, .phone-placeholder');
    const labelText = labelBox?.querySelector('.name-text, .phone-text');

    if (input.value.trim().length > 0) {
      shrink(labelText);
    } else {
      expand(labelText);
    }

    input.addEventListener('focus', () => {
      shrink(labelText);
      setFocus(labelBox);
      if (input === bizNumberInput) {
        // 라벨이 위로 떠오른 뒤에만 placeholder를 보여서 텍스트 겹침을 막는다.
        bizNumberInput.classList.add('show-placeholder');
      }
    });

    input.addEventListener('input', () => {
      if (input.value.trim().length > 0) {
        shrink(labelText);
      }
      if (input === companyInput) {
        companyAvailable = null;
        renderMessage(companyMessage, '');
      }
      if (input === bizNumberInput) {
        bizNumberAvailable = null;
        renderMessage(bizNumberMessage, '');
      }
      syncNextButton();
    });

    input.addEventListener('change', syncNextButton);

    input.addEventListener('blur', async () => {
      setNeutral(labelBox);
      if (input.value.trim().length === 0) {
        expand(labelText);
      }
      if (input === bizNumberInput && bizNumberInput.value.trim().length === 0) {
        bizNumberInput.classList.remove('show-placeholder');
      }
      if (input === companyInput) {
        await checkCompanyDuplicate();
      } else if (input === bizNumberInput) {
        await checkBizNumberDuplicate();
      } else {
        syncNextButton();
      }
    });
  });

  syncNextButton();
});
