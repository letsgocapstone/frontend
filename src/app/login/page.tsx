'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [jwtToken, setJwtToken] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch(`/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });

        if (res.ok) {
            // const data = await res.json();
            const token = res.headers.get('Authorization')!.split(' ')[1];
            // const token = res.headers.get('Authorization')!;
            setSuccessMsg('로그인 성공! 대시보드로 이동합니다.');


            // const token = data.token; // 서버에서 token을 JSON 응답으로 받는다고 가정
            setJwtToken(token); // 토큰 상태 업데이트
            localStorage.setItem("token", token);

            // 콘솔에 JWT 토큰 출력
            console.log('JWT Token:', token);
            setTimeout(() => router.push('/dashboard'), 1500);
        } else {
            const data = await res.json();
            setErrorMsg(data.error || '로그인 실패');
        }
    };

  

    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto">
          <div className="mb-15 h-30 flex items-center justify-center bg-gray-100 rounded">
            <span className="text-gray-600">로고 삽입</span>
          </div>
    
          <form onSubmit={handleLogin}>
            <div className="space-y-6">
              {/* 이메일 입력 */}
              <div className="flex w-full h-[55px] shadow-md">
                <div className="w-12 h-full flex items-center justify-center rounded-l-md bg-[#2D5E7E]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    strokeWidth="1.5" stroke="white" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 
                      2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 
                      19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 
                      0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 
                      4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 
                      2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
    
                <div className="flex-grow border border-gray-300 rounded-r-md bg-white px-3 py-2 flex items-center">
                  <input
                    id="username"
                    type="email"
                    value={username}
                    onChange={(e)=> setUsername(e.target.value)}
                    required
                    placeholder="이메일"
                    className="w-full focus:outline-none"
                  />
                </div>
              </div>
    
              {/* 비밀번호 입력 */}
              <div className="flex w-full h-[55px] shadow-md mb-10">
                <div className="w-12 h-full flex items-center justify-center rounded-l-md bg-[#2D5E7E]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    strokeWidth="1.5" stroke="white" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 
                      11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 
                      2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 
                      2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
    
                <div className="flex-grow border border-gray-300 rounded-r-md bg-white px-3 py-2 flex items-center">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="비밀번호"
                    className="w-full focus:outline-none"
                  />
                </div>
              </div>
    
              {/* 로그인 버튼 */}
              <button className="w-full py-2 bg-[#0E3C56] text-white rounded-md h-[60px] shadow-md">
                로그인
              </button>
    
              {/* 회원가입 버튼 */}
              <button  onClick={()=>router.push("register")} className="w-full py-2 border border-[#0E3C56] text-[#0E3C56] rounded-md h-[60px] shadow-md">
                회원가입
              </button>
            </div>
          </form>
    
          {errorMsg && <p className="text-red-500 text-center mt-4">{errorMsg}</p>}
          {successMsg && <p className="text-green-500 text-center mt-4">{successMsg}</p>}
        </div>
      </div>
    );
    
}