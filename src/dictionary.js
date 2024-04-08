var request = require('request');
var cheerio = require('cheerio');
var _ = require('underscore');

module.exports = {
  titles: {
    // personal: ['personal info', 'personal', 'details', 'personal information', 'personal details', 'ŞƏXSİ MƏLUMAT', 'ŞƏXSİ MƏLUMATLAR', 'Personal summary', 'FƏRDİ MƏLUMAT', 'FƏRDİ MƏLUMATLAR', 'Личная информация', 'Персональная информация', 'основные сведения', 'Общая информация', 'Личные данные', 'данные', 'Şəxsi göstəricilər', 'Şəxsi göstəriciləri', 'Qısa bioqrafik məlumat', 'bioqrafik məlumat', 'Məlumatlar', 'Ərizəçinin şəxsi məlumatları', 'şəxsi məlumatları', 'İş axtaranın şəxsi məlumatları', 'Сведения о себе', 'Общая информация о себе'],
     summary: ['summary', 'About', 'abstract', 'profile', 'brief', 'About Me', 'overview', 'objective', 'Personal Profile', 'objectives', 'WHO AM I', 'Career Objective', 'PROFESSIONAL SUMMARY', 'PROFESSIONAL PROFILE', 'Bio', 'Professional bio', 'Seeking position as a', 'Seeking position as an',  'CAREEROBJECTIVE' , 'career objective' , 'objective', 'PROFESSIONAL BIO', 'Personal summary', 'Personal bio', 'Career summary', 'Professional History', 'Background', 'Общие сведения', 'биография', 'Цель', 'Personal statement', 'профессиональная биография', 'Обо мне', 'сводка', 'общая сводка', 'Сведения о себе', 'сведения', 'Qısa məlumat', 'Краткая информация', 'Краткая', 'Haqqımda', 'Ümumi məlumat', 'Məqsədim', 'Profili', 'Profil', 'Профиль', 'Haqqında', 'Peşakar profili', 'Peşakar profil', 'Xülasə', 'Məzmun', 'Karyera hədəfim', 'Karyera hədəfi', 'Hədəfi', 'Hədəfləri', 'Ümumi məlumat', 'Şəxsi Xülasə', 'Peşəkarlıqla bağlı Xülasə', 'Xüsusi Qabiliyyətlə bağlı Xülasə', 'Qısa məzmun', 'Профессиональная деятельность', 'достижение', 'сфера деятельности', 'Успехи и достижения', 'Məqsəd', 'Məqsədi', 'Introduction'],
    experience: ['Experience',  'Projects implemented', 'positions','position','Ongoing projects', 'Projects authored', 
    'Authored projects', 'Programs', 'Projects & Programs', 'Experiences', 'employment record', 'employment history', 
    'work experience', 'Employment Experience', 'professional experience', 'RESPONSIBILITIES',
    'Work History', 'Relevant Work Experience', 'Relevant Experience', 'Selected Experience','Professional Background' ,'Key Project Experience','projects', 'client interactions', 'client interaction','client detail','client details','Client Description', 'about client' , 'about project', 'about projects', 'CLIENT SERVICE', 'Employment'],
    location:['state', 'city', 'address', 'location', 'pincode', 'pin'],
    // client: [],
    education: ['E D U C A T I O N', 'education',  'Academic Qualification', 'Education',
     'education and training', 'education & training', 'higher education', 'Educational qualifications', 'Education highlights',  'Educational highlights',
    'ACADEMIC QUALIFICATIONS',  'ACADEMIC BACKGROUND', 'ACADEMIC DETAILS', 'ACADEMIC  RECORD', 
    'Education and Qualifications', 'Education & Qualifications','Education, Honors, and Certifications','courses','certifications','specialization','certification','awards', 'honors', 'certification', 'certificates', 'certification and awards',
    'Qualifications summary', 'Educational summary', 'qualifications', 'Education summary'],
    skills: ['skills', 'Technical Skills', 'Technology Known','TECHNICAL COMPETENCIES',
    'Skills & Expertise', 'AREAS OF EXPERTISE', 'skills summary', 'expertise', 'technologies', 
    'KEY SKILLS AND COMPETENCIES', 'Skills & Competencies', 'Skills and Competencies', 'Skills/Competencies', 
    'Key Skills', 'professional skills', 'Training & Activities' , 'tools'],
    contacts: ['contacts', 'contact', 'Contact Information', 'Contact details', 'Contact info',  'CONTACT ME',  'Mobile', 'Phone No', 'Mobile No'],
    Dob: ['dob', 'date of birth' , 'DateOfBirth'],
    gender: ['gender', 'sex', 'Gender'],
    skypeId : ['skypeId','skype', 'my skype id', 'find me on skype', 'skype id', 'skype account'],
    github : ['github', 'github id', 'find me on github', 'github account'],
    linkedin: ['linkedin', 'linkedin id', 'find me on linkedin', 'linkedin account'],
    references: ['reference', 'references', 'professional references', 'Testimonials',  'Recommendations'],
    language:['LANGUAGE KNOWN', 'language', 'langugae known' ]
  },
  profiles: [
    ['github.com', function (url, Resume, profilesWatcher) {
      download(url, function (data, err) {
        if (data) {
          var $ = cheerio.load(data),
            fullName = $('.vcard-fullname').text(),
            location = $('.octicon-location').parent().text(),
            mail = $('.octicon-mail').parent().text(),
            link = $('.octicon-link').parent().text(),
            clock = $('.octicon-clock').parent().text(),
            company = $('.octicon-organization').parent().text();

          Resume.addObject('github', {
            name: fullName,
            location: location,
            email: mail,
            link: link,
            joined: clock,
            company: company
          });
        } else {
          return console.log(err);
        }
        //profilesInProgress--;
        profilesWatcher.inProgress--;
      });
    }],
    ['linkedin.com', function (url, Resume, profilesWatcher) {
      download(url, function (data, err) {
        if (data) {
          var $ = cheerio.load(data),
            linkedData = {
              positions: {
                past: [],
                current: {}
              },
              languages: [],
              skills: [],
              educations: [],
              volunteering: [],
              volunteeringOpportunities: []
            },
            $pastPositions = $('.past-position'),
            $currentPosition = $('.current-position'),
            $languages = $('#languages-view .section-item > h4 > span'),
            $skills = $('.skills-section .skill-pill .endorse-item-name-text'),
            $educations = $('.education'),
            $volunteeringListing = $('ul.volunteering-listing > li'),
            $volunteeringOpportunities = $('ul.volunteering-opportunities > li');

          linkedData.summary = $('#summary-item .summary').text();
          linkedData.name = $('.full-name').text();
          // current position
          linkedData.positions.current = {
            title: $currentPosition.find('header > h4').text(),
            company: $currentPosition.find('header > h5').text(),
            description: $currentPosition.find('p.description').text(),
            period: $currentPosition.find('.experience-date-locale').text()
          };
          // past positions
          _.forEach($pastPositions, function (pastPosition) {
            var $pastPosition = $(pastPosition);
            linkedData.positions.past.push({
              title: $pastPosition.find('header > h4').text(),
              company: $pastPosition.find('header > h5').text(),
              description: $pastPosition.find('p.description').text(),
              period: $pastPosition.find('.experience-date-locale').text()
            });
          });
          _.forEach($languages, function (language) {
            linkedData.languages.push($(language).text());
          });
          _.forEach($skills, function (skill) {
            linkedData.skills.push($(skill).text());
          });
          _.forEach($educations, function (education) {
            var $education = $(education);
            linkedData.educations.push({
              title: $education.find('header > h4').text(),
              major: $education.find('header > h5').text(),
              date: $education.find('.education-date').text()
            });
          });
          _.forEach($volunteeringListing, function (volunteering) {
            linkedData.volunteering.push($(volunteering).text());
          });
          _.forEach($volunteeringOpportunities, function (volunteering) {
            linkedData.volunteeringOpportunities.push($(volunteering).text());
          });

          Resume.addObject('linkedin', linkedData);
        } else {
          return console.log(err);
        }
        profilesWatcher.inProgress--;
      });
    }],
    'facebook.com',
    'bitbucket.org',
    'stackoverflow.com'
  ],
  inline: {
    //address: 'address',
    skype: ['skype'],
    fullName: ['Full name', 'Name and Contact Info', 'first name, middle name, last name', 'first name, patronymic, and last name', 'Ad və soyad', 'Adı və soyadı', 'Ad, Familiya', 'Ad və Familiya', 'Ad, Familiya, Ata adı',  'Ad (soyad, atasının adı)', 'Soyad, ad, ata adı', 'Soyad ad ata adı',  'Ad soyad ata adı', 'Ad, soyad, ata adı', 'Ad, soyad və ata adı', 'Adı, soyadı və ata adı', 'Adı, soyadı və atasının adı', 'Adı, soyadı, ata adı', 'Adınız, soyadınız, atanızın adı', 'Adınız, soyadınız, ata adı', 'Soyadı, adı, atasının adı',  'Soyadı, adı və atasının adı', 'Tam adı', 'Tam ad', 'Bütöv ad', 'Bütöv adı', 'Имя и Фамилия', 'Ф.И.О.', 'ФИО', 'Все имена и фамилия', 'имя, отчество и фамилия', 'имя, отчество, фамилия', 'имя, фамилия, и отчество', 'имя, фамилия, отчество', 'имя/фамилия/отчество', 'Фамилия/Имя/Отчество', 'Фамилия Имя Отчество',  'Имя Фамилия Отчество', 'фамилия, имя и отчество', 'имя, отчество, фамилия', 'полное название', 'полное наименование', 'полное имя', 'Имя и фамилия полностью', 'Ad, Soyad', 'Ad / Soyad', 'Ad / Soyad / Ata adı'],
    firstName: ['First name', 'given name', 'Ad', 'Adı', 'Adınız', 'Имя', 'название'],
    lastName: ['Surname', 'Last name', 'family name',  'second name', 'Soyadı', 'Soyadınız', 'Soyad', 'Familiya', 'Фамилия'],
    middleName: ['отчество', 'второе имя', 'среднее имя', 'ata adı', 'Middle name', 'mid.name', 'mid.', 'отч.', 'middle n.'],
    country: ['Country'],
    city: ['City', 'Home city', 'city of residence'],
    zip: ['Zip code', 'Postal code', 'Postal address', 'postcode'],
    birthday: ['Date of birth', 'Birth date', 'Birthday', 'Doğum tarixi', 'dob'],
    salary: ['Желаемый уровень дохода', 'Зарплата', 'желаемый уровень зарплаты', 'Desired salary', 'Salary expectation']
  },
  regular: {
    // name: [/([a-zA-Z])\w+\s/],  //workinhg
    name : [/s*([A-Za-z]{1,}([\.,] |[-']| ))+[A-Za-z]+\.?\s/],
    // name : [/([A-Z][a-z]*)/],
    // name: [/(?=^|$|[^\\p{L}])([A-ZÀÁÂÄÃÅĄĆČĖĘÈÉÊËƏİÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽА-ЯЁ]{1}[a-zàáâäãåąčćęèéêëėəįìíîïłńòóôöõøùúûüųūÿýżźñçčšžа-яё]{1,30}[- ]{0,1}|[A-ZÀÁÂÄÃÅĄĆČĖĘÈÉÊËƏİÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽА-ЯЁ]{1}[- \']{1}[A-ZÀÁÂÄÃÅĄĆČĖĘÈÉÊËƏİÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽА-ЯЁ]{0,1}[a-zàáâäãåąčćęèéêëėəįìíîïłńòóôöõøùúûüųūÿýżźñçčšžа-яё]{1,30}[- ]{0,1}|[a-zàáâäãåąčćęèéêëėəįìíîïłńòóôöõøùúûüųūÿýżźñçčšžа-яё]{1,2}[ -\']{1}[A-ZÀÁÂÄÃÅĄĆČĖĘÈÉÊËƏİÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽА-ЯЁ]{1}[a-zàáâäãåąčćęèéêëėəįìíîïłńòóôöõøùúûüųūÿýżźñçčšžа-яё]{1,30}){2,5}/],
    email: [/([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})/],
    phone: [/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/],
    // phone: [/((?:\+?\d{1,3}[\s-])?\(?\d{2,3}\)?[\s.-]?\d{3}[\s.-]\d{4,5})/, /((?:\+?\d{1,3}[\s-])?\(?\d{2,3}\)?[\s.-]?\d{3}[\s.-]\d{2}[\s.-]\d{2})/],
    // website: [/(http|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/]
  }
};

// helper method
function download(url, callback) {
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(body);
    } else {
      callback(null, error);
    }
  });
}