import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Carousel.css';

const Carousel = () => {
  const { lang } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      titleEn: "What is Menopause?",
      titleKn: "ಋತುಬಂಧ ಎಂದರೇನು?",
      contentEn: "Menopause is a natural biological process that marks the end of menstrual cycles. It typically occurs between ages 45-55. Common symptoms include hot flashes, mood changes, and sleep disturbances.",
      contentKn: "ಋತುಬಂಧವು ಋತುಚಕ್ರದ ಅಂತ್ಯವನ್ನು ಸೂಚಿಸುವ ನೈಸರ್ಗಿಕ ಜೈವಿಕ ಪ್ರಕ್ರಿಯೆಯಾಗಿದೆ. ಇದು ಸಾಮಾನ್ಯವಾಗಿ 45-55 ವರ್ಷಗಳ ನಡುವೆ ಸಂಭವಿಸುತ್ತದೆ."
    },
    {
      titleEn: "Menstruation & Sanitary Napkins",
      titleKn: "ಋತುಸ್ರಾವ ಮತ್ತು ಸ್ಯಾನಿಟರಿ ನ್ಯಾಪ್ಕಿನ್",
      contentEn: "Proper menstrual hygiene is crucial. Use clean sanitary napkins, change every 4-6 hours, maintain proper disposal methods.",
      contentKn: "ಸರಿಯಾದ ಋತುಸ್ರಾವದ ನೈರ್ಮಲ್ಯವು ಮುಖ್ಯವಾಗಿದೆ. ಸ್ವಚ್ಛ ಸ್ಯಾನಿಟರಿ ನ್ಯಾಪ್ಕಿನ್ಗಳನ್ನು ಬಳಸಿ, ಪ್ರತಿ 4-6 ಗಂಟೆಗಳಿಗೊಮ್ಮೆ ಬದಲಾಯಿಸಿ."
    },
    {
      titleEn: "Anemia: Causes & Cure",
      titleKn: "ರಕ್ತಹೀನತೆ: ಕಾರಣಗಳು ಮತ್ತು ಚಿಕಿತ್ಸೆ",
      contentEn: "Anemia occurs when blood lacks healthy red blood cells. Prevention: Eat iron-rich foods (spinach, legumes, meat), vitamin C for absorption.",
      contentKn: "ದೇಹದಲ್ಲಿ ಆರೋಗ್ಯಕರ ಕೆಂಪು ರಕ್ತ ಕಣಗಳ ಕೊರತೆಯಾದಾಗ ರಕ್ತಹೀನತೆ ಉಂಟಾಗುತ್ತದೆ. ಕಬ್ಬಿಣ ಭರಿತ ಆಹಾರಗಳನ್ನು ಸೇವಿಸಿ."
    },
    {
      titleEn: "Healthcare During Pregnancy",
      titleKn: "ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ಆರೋಗ್ಯ ರಕ್ಷಣೆ",
      contentEn: "Essential tips: Take prenatal vitamins, stay hydrated, eat balanced diet. Safe exercises: walking, swimming, prenatal yoga.",
      contentKn: "ಗರ್ಭಧಾರಣೆಗೆ ಅಗತ್ಯ ಸಲಹೆಗಳು: ಪ್ರಸವಪೂರ್ವ ವಿಟಮಿನ್ಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ, ಹೈಡ್ರೇಟ್ ಆಗಿರಿ, ಸಮತೋಲಿತ ಆಹಾರವನ್ನು ಸೇವಿಸಿ."
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const current = slides[currentSlide];

  return (
    <div className="carousel-container">
      <div className="carousel-slide">
        <div className="slide-content">
          <h3>{lang === 'en' ? current.titleEn : current.titleKn}</h3>
          <p>{lang === 'en' ? current.contentEn : current.contentKn}</p>
        </div>
      </div>
      <button className="carousel-btn prev" onClick={prevSlide}>❮</button>
      <button className="carousel-btn next" onClick={nextSlide}>❯</button>
      <div className="carousel-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;