import { useEffect, useState } from 'react'
import IconMapPin from '../../components/Icon/IconMapPin';
import { Link } from 'react-router-dom';
const rowData = [
  {
      id: 1,
      img:'https://th.bing.com/th/id/R.7b225d8f7343df94f9b3c7c608805694?rik=iWYU%2fUlGD5g%2fJQ&riu=http%3a%2f%2fpaulcarrollphoto.com%2fwp-content%2fuploads%2f2013%2f08%2fslider6.jpg&ehk=AkpVVn2pVhdSW1KLuDlLOhn%2b4e3aye2BR3Is%2bxc%2btpg%3d&risl=&pid=ImgRaw&r=0',
      ShowRoom: 'ABC',
     description:' Maecenas nec mi vel lacus condimentum rhoncus dignissim egestas orci. Integer blandit porta placerat. Vestibulum in ultricies.',
      Location: 'Malappuram',
      Map: 'https://www.google.com/search?q=gmail&rlz=1C1VDKB_enIN1042IN1042&oq=g&gs_lcrp=EgZjaHJvbWUqDQgDEAAYgwEYsQMYgAQyBggAEEUYOTIGCAEQRRg7MgwIAhAjGCcYgAQYigUyDQgDEAAYgwEYsQMYgAQyEwgEEC4YgwEYxwEYsQMY0QMYgAQyDQgFEAAYgwEYsQMYgAQyDQgGEAAYgwEYsQMYgAQyDQgHEAAYgwEYsQMYgAQyDQgIEAAYgwEYsQMYgAQyBwgJEAAYjwLSAQoxNDI4NGowajE1qAIAsAIA&sourceid=chrome&ie=UTF-8',
    
  },
  {
      id: 2,
      img:'https://blog-images.carshop.co.uk/2019/06/Penske-Wynn-Ferrari-Maserati--5-.jpg',

      ShowRoom: 'DDYTFYGH',
      description:' Maecenas nec mi vel lacus condimentum rhoncus dignissim egestas orci. Integer blandit porta placerat. Vestibulum in ultricies.',

      Location: 'kozhikkode',
      Map: 'https://www.google.com/search?q=gmail&rlz=1C1VDKB_enIN1042IN1042&oq=g&gs_lcrp=EgZjaHJvbWUqDQgDEAAYgwEYsQMYgAQyBggAEEUYOTIGCAEQRRg7MgwIAhAjGCcYgAQYigUyDQgDEAAYgwEYsQMYgAQyEwgEEC4YgwEYxwEYsQMY0QMYgAQyDQgFEAAYgwEYsQMYgAQyDQgGEAAYgwEYsQMYgAQyDQgHEAAYgwEYsQMYgAQyDQgIEAAYgwEYsQMYgAQyBwgJEAAYjwLSAQoxNDI4NGowajE1qAIAsAIA&sourceid=chrome&ie=UTF-8',
  },
  {
      id: 3,
      img:'https://storageconcepts.co.uk/wp-content/uploads/2014/10/Redline-13-Oct14-037.jpg',

      ShowRoom: 'YGHHFVHGVNB',
      description:' Maecenas nec mi vel lacus condimentum rhoncus dignissim egestas orci. Integer blandit porta placerat. Vestibulum in ultricies.',

      Location: 'idukki',
      Map: 'https://thulasi.psc.kerala.gov.in/thulasi/',
  },
  {
      id: 4,
      img:'https://th.bing.com/th/id/R.7b225d8f7343df94f9b3c7c608805694?rik=iWYU%2fUlGD5g%2fJQ&riu=http%3a%2f%2fpaulcarrollphoto.com%2fwp-content%2fuploads%2f2013%2f08%2fslider6.jpg&ehk=AkpVVn2pVhdSW1KLuDlLOhn%2b4e3aye2BR3Is%2bxc%2btpg%3d&risl=&pid=ImgRaw&r=0',

      ShowRoom: 'GYJGIUJKHI',
      description:' Maecenas nec mi vel lacus condimentum rhoncus dignissim egestas orci. Integer blandit porta placerat. Vestibulum in ultricies.',

      Location: 'kasr',
      Map: 'https://www.google.com/search?q=gmail&rlz=1C1VDKB_enIN1042IN1042&oq=g&gs_lcrp=EgZjaHJvbWUqDQgDEAAYgwEYsQMYgAQyBggAEEUYOTIGCAEQRRg7MgwIAhAjGCcYgAQYigUyDQgDEAAYgwEYsQMYgAQyEwgEEC4YgwEYxwEYsQMY0QMYgAQyDQgFEAAYgwEYsQMYgAQyDQgGEAAYgwEYsQMYgAQyDQgHEAAYgwEYsQMYgAQyDQgIEAAYgwEYsQMYgAQyBwgJEAAYjwLSAQoxNDI4NGowajE1qAIAsAIA&sourceid=chrome&ie=UTF-8',
  },
  {
      id: 5,
      img:'https://th.bing.com/th/id/R.7b225d8f7343df94f9b3c7c608805694?rik=iWYU%2fUlGD5g%2fJQ&riu=http%3a%2f%2fpaulcarrollphoto.com%2fwp-content%2fuploads%2f2013%2f08%2fslider6.jpg&ehk=AkpVVn2pVhdSW1KLuDlLOhn%2b4e3aye2BR3Is%2bxc%2btpg%3d&risl=&pid=ImgRaw&r=0',

      ShowRoom: 'KGYUGTY',
      description:' Maecenas nec mi vel lacus condimentum rhoncus dignissim egestas orci. Integer blandit porta placerat. Vestibulum in ultricies.',

      Location: 'Malappuram',
      Map: 'https://www.google.com/search?q=gmail&rlz=1C1VDKB_enIN1042IN1042&oq=g&gs_lcrp=EgZjaHJvbWUqDQgDEAAYgwEYsQMYgAQyBggAEEUYOTIGCAEQRRg7MgwIAhAjGCcYgAQYigUyDQgDEAAYgwEYsQMYgAQyEwgEEC4YgwEYxwEYsQMY0QMYgAQyDQgFEAAYgwEYsQMYgAQyDQgGEAAYgwEYsQMYgAQyDQgHEAAYgwEYsQMYgAQyDQgIEAAYgwEYsQMYgAQyBwgJEAAYjwLSAQoxNDI4NGowajE1qAIAsAIA&sourceid=chrome&ie=UTF-8',
      },
  
  {
      id: 6,
      img:'https://th.bing.com/th/id/R.7b225d8f7343df94f9b3c7c608805694?rik=iWYU%2fUlGD5g%2fJQ&riu=http%3a%2f%2fpaulcarrollphoto.com%2fwp-content%2fuploads%2f2013%2f08%2fslider6.jpg&ehk=AkpVVn2pVhdSW1KLuDlLOhn%2b4e3aye2BR3Is%2bxc%2btpg%3d&risl=&pid=ImgRaw&r=0',

      ShowRoom: 'GHHJHU',
      description:' Maecenas nec mi vel lacus condimentum rhoncus dignissim egestas orci. Integer blandit porta placerat. Vestibulum in ultricies.',

      Location: 'Malappuram',
      Map: 'https://www.google.com/search?q=gmail&rlz=1C1VDKB_enIN1042IN1042&oq=g&gs_lcrp=EgZjaHJvbWUqDQgDEAAYgwEYsQMYgAQyBggAEEUYOTIGCAEQRRg7MgwIAhAjGCcYgAQYigUyDQgDEAAYgwEYsQMYgAQyEwgEEC4YgwEYxwEYsQMY0QMYgAQyDQgFEAAYgwEYsQMYgAQyDQgGEAAYgwEYsQMYgAQyDQgHEAAYgwEYsQMYgAQyDQgIEAAYgwEYsQMYgAQyBwgJEAAYjwLSAQoxNDI4NGowajE1qAIAsAIA&sourceid=chrome&ie=UTF-8 ',
  },
  {
      id: 7,
      img:'https://th.bing.com/th/id/R.7b225d8f7343df94f9b3c7c608805694?rik=iWYU%2fUlGD5g%2fJQ&riu=http%3a%2f%2fpaulcarrollphoto.com%2fwp-content%2fuploads%2f2013%2f08%2fslider6.jpg&ehk=AkpVVn2pVhdSW1KLuDlLOhn%2b4e3aye2BR3Is%2bxc%2btpg%3d&risl=&pid=ImgRaw&r=0',

      ShowRoom: 'ABC',
      description:' Maecenas nec mi vel lacus condimentum rhoncus dignissim egestas orci. Integer blandit porta placerat. Vestibulum in ultricies.',

      Location: 'Malappuram',
      Map: 'https://www.google.com/search?q=gmail&rlz=1C1VDKB_enIN1042IN1042&oq=g&gs_lcrp=EgZjaHJvbWUqDQgDEAAYgwEYsQMYgAQyBggAEEUYOTIGCAEQRRg7MgwIAhAjGCcYgAQYigUyDQgDEAAYgwEYsQMYgAQyEwgEEC4YgwEYxwEYsQMY0QMYgAQyDQgFEAAYgwEYsQMYgAQyDQgGEAAYgwEYsQMYgAQyDQgHEAAYgwEYsQMYgAQyDQgIEAAYgwEYsQMYgAQyBwgJEAAYjwLSAQoxNDI4NGowajE1qAIAsAIA&sourceid=chrome&ie=UTF-8',
  },
  {
      id: 8,
      img:'https://th.bing.com/th/id/R.7b225d8f7343df94f9b3c7c608805694?rik=iWYU%2fUlGD5g%2fJQ&riu=http%3a%2f%2fpaulcarrollphoto.com%2fwp-content%2fuploads%2f2013%2f08%2fslider6.jpg&ehk=AkpVVn2pVhdSW1KLuDlLOhn%2b4e3aye2BR3Is%2bxc%2btpg%3d&risl=&pid=ImgRaw&r=0',

      ShowRoom: 'ABC',
      description:' Maecenas nec mi vel lacus condimentum rhoncus dignissim egestas orci. Integer blandit porta placerat. Vestibulum in ultricies.',

      Location: 'Malappuram',
      Map: 'https://www.google.com/search?q=gmail&rlz=1C1VDKB_enIN1042IN1042&oq=g&gs_lcrp=EgZjaHJvbWUqDQgDEAAYgwEYsQMYgAQyBggAEEUYOTIGCAEQRRg7MgwIAhAjGCcYgAQYigUyDQgDEAAYgwEYsQMYgAQyEwgEEC4YgwEYxwEYsQMY0QMYgAQyDQgFEAAYgwEYsQMYgAQyDQgGEAAYgwEYsQMYgAQyDQgHEAAYgwEYsQMYgAQyDQgIEAAYgwEYsQMYgAQyBwgJEAAYjwLSAQoxNDI4NGowajE1qAIAsAIA&sourceid=chrome&ie=UTF-8',
  },
 
];

const ShowRoom = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredData = rowData.filter((item) =>
    item.ShowRoom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mb-5">
      <h5 className="font-semibold text-lg dark:text-white-light mb-5">Showroom Details</h5>
  
      <input
        type="text"
        className="form-input w-full mb-3"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
  
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredData.map((item) => (
          <div key={item.id} className="bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] rounded border border-white-light dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none p-5">
  
            <div className="mb-5 w-full h-32 rounded-full overflow-hidden">
              <img src={item.img} alt={item.ShowRoom} className="w-full h-full object-cover" />
            </div>
  
            <Link to={item.Map}><IconMapPin className='text-primary'/></Link>
  
            <div className="text-center">
              <h5 className="text-[#3b3f5c] text-[15px] font-semibold mb-2 dark:text-white-light">{item.ShowRoom}</h5>
              <p className="mb-2 text-white-dark">{item.Location}</p>
              <p className="font-semibold text-white-dark mt-4">{item.description}</p>
            </div>
  
            {/* Example: Adding a button with a primary style */}
            {/* <button className='btn btn-primary'>Add</button> */}
          </div>
        ))}
      </div>
    </div>
  );
  
};

export default ShowRoom;
