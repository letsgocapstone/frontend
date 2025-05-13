'use client'

import { useParams } from 'next/navigation'

export default function ExampleClientComponent() {
    const params = useParams<{ id: string }>()

    // Route -> /shop/[tag]/[item]
    // URL -> /shop/shoes/nike-air-max-97
    // `params` -> { tag: 'shoes', item: 'nike-air-max-97' }
    console.log(params)

    return (<div>{params.id}</div>);
}