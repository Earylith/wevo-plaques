import { Accommodation } from "@/lib/types/accommodation";

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return text;
  
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    
    // The response is an array of arrays, we need to join the first elements
    let translated = "";
    if (data && data[0]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data[0].forEach((item: any) => {
        if (item[0]) translated += item[0];
      });
    }
    return translated || text;
  } catch (err) {
    console.error("Translation error for text:", text, err);
    return text; // Fallback to original text if error occurs
  }
}

export async function translateAccommodation(acc: Accommodation, targetLang: string): Promise<Accommodation> {
  if (!targetLang || targetLang === "fr" || targetLang === "auto") return acc;

  // Clone object
  const newAcc: Accommodation = JSON.parse(JSON.stringify(acc));

  // We group translations using Promise.all to run them concurrently
  const promises: Promise<void>[] = [];
  
  if (newAcc.property.welcomeMessage) {
    promises.push(
      translateText(newAcc.property.welcomeMessage, targetLang).then(res => { newAcc.property.welcomeMessage = res; })
    );
  }
  
  if (newAcc.comfortOptions?.transports) {
    promises.push(
      translateText(newAcc.comfortOptions.transports, targetLang).then(res => { newAcc.comfortOptions!.transports = res; })
    );
  }

  // Rules (Array of strings)
  if (newAcc.rules && newAcc.rules.length > 0) {
    newAcc.rules.forEach((rule, idx) => {
      promises.push(
        translateText(rule, targetLang).then(res => { newAcc.rules![idx] = res; })
      );
    });
  }

  // Recommendations
  if (newAcc.recommendations && newAcc.recommendations.length > 0) {
    newAcc.recommendations.forEach((rec, idx) => {
      promises.push(translateText(rec.title, targetLang).then(res => { newAcc.recommendations[idx].title = res; }));
      promises.push(translateText(rec.description, targetLang).then(res => { newAcc.recommendations[idx].description = res; }));
      promises.push(translateText(rec.category, targetLang).then(res => { newAcc.recommendations[idx].category = res; }));
    });
  }

  // FAQ
  if (newAcc.comfortOptions?.faq && newAcc.comfortOptions.faq.length > 0) {
    newAcc.comfortOptions.faq.forEach((f, idx) => {
      promises.push(translateText(f.question, targetLang).then(res => { newAcc.comfortOptions!.faq![idx].question = res; }));
      promises.push(translateText(f.answer, targetLang).then(res => { newAcc.comfortOptions!.faq![idx].answer = res; }));
    });
  }

  // Upsells
  if (newAcc.comfortOptions?.upsells && newAcc.comfortOptions.upsells.length > 0) {
    newAcc.comfortOptions.upsells.forEach((u, idx) => {
      promises.push(translateText(u.title, targetLang).then(res => { newAcc.comfortOptions!.upsells![idx].title = res; }));
      promises.push(translateText(u.description, targetLang).then(res => { newAcc.comfortOptions!.upsells![idx].description = res; }));
    });
  }

  // Wait for all translations to complete
  await Promise.all(promises);

  return newAcc;
}
